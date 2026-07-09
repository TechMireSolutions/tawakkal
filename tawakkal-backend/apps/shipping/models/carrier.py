from django.db import models
from apps.core.models import BaseModel

class ShippingCarrier(BaseModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    tracking_url_template = models.URLField(max_length=500, blank=True)
    
    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class ShippingMethod(BaseModel):
    carrier = models.ForeignKey(ShippingCarrier, on_delete=models.CASCADE, related_name='methods')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    estimated_days = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['carrier__name', 'name']

    def __str__(self):
        return f"{self.carrier.name} - {self.name}"
