from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .order import Order

class OrderTimeline(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='timeline_events')
    event_type = models.CharField(max_length=100)
    description = models.TextField()
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='performed_order_events')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order.order_number} - {self.event_type}"
