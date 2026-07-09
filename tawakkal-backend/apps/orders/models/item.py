from django.db import models
from apps.core.models import BaseModel
from apps.catalog.models import ProductVariant
from .order import Order

class OrderItem(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')
    
    # Snapshot Fields - crucial for historical accuracy
    product_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)
    barcode = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=50, blank=True)
    size = models.CharField(max_length=50, blank=True)
    
    quantity = models.PositiveIntegerField(default=1)
    
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.sku} for {self.order.order_number}"
