from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.orders.models.order import Order
from apps.orders.models.item import OrderItem
from .carrier import ShippingCarrier, ShippingMethod

class ShipmentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    READY = 'READY', 'Ready'
    PACKED = 'PACKED', 'Packed'
    SHIPPED = 'SHIPPED', 'Shipped'
    IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
    DELIVERED = 'DELIVERED', 'Delivered'
    FAILED = 'FAILED', 'Failed'
    RETURNED = 'RETURNED', 'Returned'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Shipment(BaseModel):
    shipment_number = models.CharField(max_length=50, unique=True, db_index=True)
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='shipments')
    
    # Optional warehouse assignment
    warehouse = models.ForeignKey('stores.Warehouse', on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments')
    
    carrier = models.ForeignKey(ShippingCarrier, on_delete=models.PROTECT, related_name='shipments', null=True, blank=True)
    shipping_method = models.ForeignKey(ShippingMethod, on_delete=models.PROTECT, related_name='shipments', null=True, blank=True)
    
    tracking_number = models.CharField(max_length=100, blank=True, db_index=True)
    label_url = models.URLField(max_length=500, blank=True)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=ShipmentStatus.choices, default=ShipmentStatus.PENDING, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.shipment_number

class ShipmentItem(BaseModel):
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='items')
    order_item = models.ForeignKey(OrderItem, on_delete=models.PROTECT, related_name='shipment_items')
    
    # Snapshots
    sku = models.CharField(max_length=100)
    product_name = models.CharField(max_length=255)
    variant_id = models.UUIDField(null=True, blank=True)  # Snapshot ID
    
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.sku} in {self.shipment.shipment_number}"

class ShipmentTimeline(BaseModel):
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='timeline_events')
    event_type = models.CharField(max_length=100)
    description = models.TextField()
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} for {self.shipment.shipment_number}"
