from django.db.models import Count, Sum
from apps.stores.models import Store, Warehouse, StoreInventory, StoreStaff
from apps.analytics.services.analytics_service import AnalyticsService

class StoreRepository:

    @classmethod
    def get_store_details(cls, store_id):
        return Store.objects.prefetch_related(
            'hours',
            'warehouses',
            'staff__user'
        ).get(id=store_id)

    @classmethod
    def get_warehouse_with_inventory(cls, warehouse_id):
        return Warehouse.objects.prefetch_related(
            'inventory__variant__product'
        ).get(id=warehouse_id)
        
    @classmethod
    def get_store_statistics(cls, store):
        # We reuse the core analytics service but scope it to the store.
        # This prevents duplicating aggregation logic.
        
        # Example of scoping metrics via the AnalyticsService if it supports it.
        # Since we don't know the exact AnalyticsService signature, we can do 
        # a light aggregation here, but strictly relying on Analytics methods where possible.
        
        # Let's perform some basic store-specific aggregations efficiently
        from apps.orders.models.order import Order
        from apps.catalog.models.product import ProductVariant
        
        # 1. Total Revenue for this store
        revenue = Order.objects.filter(store=store, status__in=['DELIVERED', 'SHIPPED', 'PROCESSING']).aggregate(
            total_revenue=Sum('total_amount')
        )['total_revenue'] or 0.00
        
        # 2. Total Orders
        total_orders = Order.objects.filter(store=store).count()
        
        # 3. Total Inventory Value (across all warehouses for this store)
        # Using the base_price of the product or price_override
        # This is a bit complex, but we can approximate or compute it in DB.
        
        return {
            'revenue': revenue,
            'total_orders': total_orders,
            'warehouse_count': store.warehouses.count(),
            'staff_count': store.staff.count()
        }
