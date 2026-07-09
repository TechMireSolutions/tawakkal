from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from apps.core.services import BaseService
from apps.payments.services.sequence_service import SequenceGeneratorService
from apps.catalog.services.product_service import ProductService
from apps.orders.models.order import OrderStatus
from ..models.shipment import Shipment, ShipmentItem, ShipmentStatus, ShipmentTimeline
from ..repositories.shipment_repository import ShipmentRepository

class ShipmentService(BaseService):
    repository = ShipmentRepository

    VALID_TRANSITIONS = {
        ShipmentStatus.PENDING: [ShipmentStatus.READY, ShipmentStatus.CANCELLED],
        ShipmentStatus.READY: [ShipmentStatus.PACKED, ShipmentStatus.CANCELLED],
        ShipmentStatus.PACKED: [ShipmentStatus.SHIPPED, ShipmentStatus.CANCELLED],
        ShipmentStatus.SHIPPED: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.FAILED],
        ShipmentStatus.IN_TRANSIT: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.FAILED],
        ShipmentStatus.OUT_FOR_DELIVERY: [ShipmentStatus.DELIVERED, ShipmentStatus.FAILED],
        ShipmentStatus.DELIVERED: [ShipmentStatus.RETURNED],
        ShipmentStatus.FAILED: [],
        ShipmentStatus.RETURNED: [],
        ShipmentStatus.CANCELLED: []
    }

    @classmethod
    @transaction.atomic
    def create_shipment(cls, order, items_data, user=None, **kwargs):
        """
        items_data format: [{'order_item_id': UUID, 'quantity': int}, ...]
        """
        # Validate quantities
        for item_data in items_data:
            order_item = order.items.get(id=item_data['order_item_id'])
            
            # Calculate already shipped quantity
            shipped_qty = sum(
                si.quantity for si in order_item.shipment_items.filter(
                    shipment__status__in=[
                        ShipmentStatus.PENDING, ShipmentStatus.READY, ShipmentStatus.PACKED, 
                        ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT, 
                        ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED
                    ]
                )
            )
            
            if shipped_qty + item_data['quantity'] > order_item.quantity:
                raise ValidationError(f"Cannot ship more {order_item.sku} than ordered. Ordered: {order_item.quantity}, Already processing: {shipped_qty}")

        shipment_number = SequenceGeneratorService.generate("SHP", Shipment)
        
        shipment = Shipment.objects.create(
            shipment_number=shipment_number,
            order=order,
            carrier_id=kwargs.get('carrier_id'),
            shipping_method_id=kwargs.get('shipping_method_id'),
            status=ShipmentStatus.PENDING
        )
        
        for item_data in items_data:
            order_item = order.items.get(id=item_data['order_item_id'])
            qty = item_data['quantity']
            
            # Sub-divide the pricing fields proportionately based on the quantity
            # This is critical for snapshotting partial shipments accurately
            from decimal import Decimal
            ratio = Decimal(qty) / Decimal(order_item.quantity)
            
            ShipmentItem.objects.create(
                shipment=shipment,
                order_item=order_item,
                sku=order_item.sku,
                product_name=order_item.product_name,
                variant_id=order_item.variant_id,
                quantity=qty,
                unit_price=order_item.unit_price,
                tax_amount=order_item.tax_amount * ratio,
                discount_amount=order_item.discount_amount * ratio
            )

        ShipmentTimeline.objects.create(
            shipment=shipment,
            event_type='Created',
            description='Shipment created.',
            performed_by=user
        )

        # Module 15: Notify Shipment Created
        if hasattr(order.customer, 'user') and order.customer.user:
            from apps.notifications.services.notification_service import NotificationService
            NotificationService.dispatch(
                recipient=order.customer.user,
                template_code='SHIPMENT_CREATED',
                variables={'order_number': order.order_number, 'shipment_number': shipment.shipment_number, 'customer_name': order.customer.user.first_name},
                related_object=shipment,
                sender=user
            )

        return shipment

    @classmethod
    @transaction.atomic
    def update_status(cls, shipment_id, new_status, user=None, tracking_number=None, label_url=None):
        # We need select_for_update to lock the shipment while modifying state
        shipment = Shipment.objects.select_for_update().get(id=shipment_id)
        old_status = shipment.status
        
        if old_status == new_status:
            return shipment

        if new_status not in cls.VALID_TRANSITIONS.get(old_status, []):
            raise ValidationError(f"Invalid transition from {old_status} to {new_status}")

        shipment.status = new_status
        
        if tracking_number:
            shipment.tracking_number = tracking_number
        if label_url:
            shipment.label_url = label_url

        # Handle Hooks
        if new_status == ShipmentStatus.SHIPPED:
            shipment.shipped_at = timezone.now()
            cls._handle_shipped(shipment)
        
        elif new_status == ShipmentStatus.DELIVERED:
            shipment.delivered_at = timezone.now()

        shipment.save()
        
        ShipmentTimeline.objects.create(
            shipment=shipment,
            event_type=f'Status Changed: {new_status}',
            description=f'Shipment transitioned from {old_status} to {new_status}.',
            performed_by=user
        )
        
        # Module 15: Notify Shipment Status
        if hasattr(shipment.order.customer, 'user') and shipment.order.customer.user:
            from apps.notifications.services.notification_service import NotificationService
            template_code = f"SHIPMENT_{new_status.upper()}"
            NotificationService.dispatch(
                recipient=shipment.order.customer.user,
                template_code=template_code,
                variables={'order_number': shipment.order.order_number, 'shipment_number': shipment.shipment_number, 'customer_name': shipment.order.customer.user.first_name, 'status': new_status},
                related_object=shipment,
                sender=user
            )
        
        cls._sync_order_status(shipment.order)
        
        return shipment

    @classmethod
    def _handle_shipped(cls, shipment):
        for item in shipment.items.all():
            if item.variant_id:
                # Deduct physical stock and unreserve it
                ProductService.adjust_stock(item.variant_id, -item.quantity, 'SHIPPED', user=None, reference_type='SHIPMENT', reference_id=shipment.shipment_number)
                ProductService.release_stock(item.variant_id, item.quantity)

    @classmethod
    def _sync_order_status(cls, order):
        # We must lock the order to prevent concurrent updates from multiple shipments
        # But doing select_for_update here could cause deadlocks if not careful.
        # Instead, we just evaluate the state. In a real system, we'd queue an async task or rely on row-level locks on the order.
        
        # Safe strategy: Just aggregate statuses
        shipments = list(order.shipments.all())
        if not shipments:
            return
            
        all_delivered = all(s.status == ShipmentStatus.DELIVERED for s in shipments)
        any_shipped = any(s.status in [ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED] for s in shipments)
        all_cancelled = all(s.status == ShipmentStatus.CANCELLED for s in shipments)
        
        if all_delivered:
            from apps.orders.services.order_service import OrderService
            if order.status == OrderStatus.PROCESSING:
                OrderService.update_status(order.id, OrderStatus.SHIPPED)
            if order.status == OrderStatus.SHIPPED:
                OrderService.update_status(order.id, OrderStatus.DELIVERED)
                
        elif any_shipped and order.status == OrderStatus.PROCESSING:
            from apps.orders.services.order_service import OrderService
            OrderService.update_status(order.id, OrderStatus.SHIPPED)
            
        elif all_cancelled and order.status in [OrderStatus.PENDING, OrderStatus.PROCESSING]:
            # This is complex, usually we let an admin cancel the order separately.
            pass
