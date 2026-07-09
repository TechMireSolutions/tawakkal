from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .order import Order

class OrderNote(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='internal_notes')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='authored_order_notes')
    text = models.TextField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note on {self.order.order_number} by {self.author}"
