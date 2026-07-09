from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .customer import Customer

class CustomerTimeline(BaseModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='timeline_events')
    event_type = models.CharField(max_length=100)
    description = models.TextField()
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.customer_code} - {self.event_type}"
