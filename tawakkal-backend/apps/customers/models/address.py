from django.db import models
from apps.core.models import BaseModel
from .customer import Customer

class AddressType(models.TextChoices):
    BILLING = 'BILLING', 'Billing'
    SHIPPING = 'SHIPPING', 'Shipping'
    OTHER = 'OTHER', 'Other'

class CustomerAddress(BaseModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(max_length=20, choices=AddressType.choices, default=AddressType.SHIPPING)
    
    is_default = models.BooleanField(default=False)
    
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    
    company = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.customer.full_name} - {self.address_type} - {self.city}"
