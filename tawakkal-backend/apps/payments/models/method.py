from django.db import models
from apps.core.models import BaseModel

class PaymentMethod(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    provider = models.CharField(max_length=100)
    
    is_active = models.BooleanField(default=True)
    supports_refund = models.BooleanField(default=True)
    supports_partial = models.BooleanField(default=True)
    
    configuration = models.JSONField(default=dict, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name
