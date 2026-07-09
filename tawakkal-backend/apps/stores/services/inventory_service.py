from django.db import transaction
from django.db.models import Sum
from apps.stores.models import StoreInventory
from apps.catalog.models.product import ProductVariant, InventoryLog, InventoryReason

class InventoryTransferService:
    
    @classmethod
    def transfer_inventory(cls, variant_id, source_warehouse_id, dest_warehouse_id, quantity, user):
        if quantity <= 0:
            raise ValueError("Transfer quantity must be greater than zero.")
            
        if source_warehouse_id == dest_warehouse_id:
            raise ValueError("Source and destination warehouses cannot be the same.")

        with transaction.atomic():
            # Lock the source and dest inventory records to prevent race conditions
            source_inv = StoreInventory.objects.select_for_update().filter(
                warehouse_id=source_warehouse_id, variant_id=variant_id
            ).first()
            
            if not source_inv or source_inv.available_stock < quantity:
                raise ValueError("Insufficient stock in source warehouse.")
                
            dest_inv, _ = StoreInventory.objects.select_for_update().get_or_create(
                warehouse_id=dest_warehouse_id, variant_id=variant_id,
                defaults={'stock': 0, 'reserved_stock': 0, 'reorder_level': 0}
            )
            
            # Deduct from source
            before_source = source_inv.stock
            source_inv.stock -= quantity
            source_inv.save()
            
            # Add to dest
            before_dest = dest_inv.stock
            dest_inv.stock += quantity
            dest_inv.save()
            
            # Since the transfer doesn't change the absolute total stock across all warehouses,
            # we technically don't need to update ProductVariant.stock, but let's sync it to be safe.
            cls.sync_variant_aggregates(variant_id)
            
            # Create Logs
            InventoryLog.objects.create(
                variant_id=variant_id,
                change=-quantity,
                before_quantity=before_source,
                after_quantity=source_inv.stock,
                reason=InventoryReason.ADJUSTMENT,
                reference_type='TRANSFER_OUT',
                reference_id=str(dest_warehouse_id),
                performed_by=user
            )
            
            InventoryLog.objects.create(
                variant_id=variant_id,
                change=quantity,
                before_quantity=before_dest,
                after_quantity=dest_inv.stock,
                reason=InventoryReason.ADJUSTMENT,
                reference_type='TRANSFER_IN',
                reference_id=str(source_warehouse_id),
                performed_by=user
            )

    @classmethod
    def sync_variant_aggregates(cls, variant_id):
        """
        Synchronizes the aggregate fields on ProductVariant based on StoreInventory.
        Must be called within an atomic transaction.
        """
        # We lock the variant row to prevent concurrent aggregate overwrites
        variant = ProductVariant.objects.select_for_update().get(id=variant_id)
        
        aggregates = StoreInventory.objects.filter(variant_id=variant_id).aggregate(
            total_stock=Sum('stock'),
            total_reserved=Sum('reserved_stock')
        )
        
        variant.stock = aggregates['total_stock'] or 0
        variant.reserved_stock = aggregates['total_reserved'] or 0
        variant.save(update_fields=['stock', 'reserved_stock'])
