from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.orders.models.order import Order
from .shipment import ShipmentItem

class ReturnReason(BaseModel):
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['code']

    def __str__(self):
        return self.description

class ReturnStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', 'Requested'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    RECEIVED = 'RECEIVED', 'Received'
    REFUNDED = 'REFUNDED', 'Refunded'
    CLOSED = 'CLOSED', 'Closed'

class ReturnRequest(BaseModel):
    return_number = models.CharField(max_length=50, unique=True, db_index=True)
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='return_requests')
    
    status = models.CharField(max_length=20, choices=ReturnStatus.choices, default=ReturnStatus.REQUESTED, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.return_number

class ReturnItem(BaseModel):
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='items')
    shipment_item = models.ForeignKey(ShipmentItem, on_delete=models.PROTECT, related_name='returned_items')
    
    reason = models.ForeignKey(ReturnReason, on_delete=models.PROTECT, null=True, blank=True)
    quantity = models.PositiveIntegerField()
    
    # Snapshots (inherited from ShipmentItem/OrderItem)
    sku = models.CharField(max_length=100)
    product_name = models.CharField(max_length=255)
    variant_id = models.UUIDField(null=True, blank=True)
    
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.sku} returned"

class ReturnTimeline(BaseModel):
    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE, related_name='timeline_events')
    event_type = models.CharField(max_length=100)
    description = models.TextField()
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} for {self.return_request.return_number}"
