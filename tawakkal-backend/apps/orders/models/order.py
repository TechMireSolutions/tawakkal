from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.customers.models import Customer, CustomerAddress

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PROCESSING = 'PROCESSING', 'Processing'
    SHIPPED = 'SHIPPED', 'Shipped'
    DELIVERED = 'DELIVERED', 'Delivered'
    RETURN_REQUESTED = 'RETURN_REQUESTED', 'Return Requested'
    RETURNED = 'RETURNED', 'Returned'
    CANCELLED = 'CANCELLED', 'Cancelled'
    REFUNDED = 'REFUNDED', 'Refunded'

class PaymentStatus(models.TextChoices):
    UNPAID = 'UNPAID', 'Unpaid'
    PARTIALLY_PAID = 'PARTIALLY_PAID', 'Partially Paid'
    PAID = 'PAID', 'Paid'
    REFUNDED = 'REFUNDED', 'Refunded'
    FAILED = 'FAILED', 'Failed'

class Order(BaseModel):
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='orders')
    
    store = models.ForeignKey('stores.Store', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    # Store addresses as foreign keys, but in a real ERP you might snapshot the address fields to avoid mutations
    # affecting historical orders. For now, linking is fine as long as we don't allow modifying address fields in place.
    shipping_address = models.ForeignKey(CustomerAddress, on_delete=models.PROTECT, related_name='shipping_orders')
    billing_address = models.ForeignKey(CustomerAddress, on_delete=models.PROTECT, related_name='billing_orders', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING, db_index=True)
    
    # Financials
    currency = models.CharField(max_length=3, default='USD')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    shipping_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Payment Info (Generic)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID, db_index=True)
    payment_provider = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    
    # Shipping Info (Generic)
    shipping_provider = models.CharField(max_length=50, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    tracking_url = models.URLField(max_length=500, blank=True)
    shipping_status = models.CharField(max_length=50, blank=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.customer.email}"
