from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .payment import Payment
from .invoice import Invoice

class PaymentTimeline(BaseModel):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='timeline_events', null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='timeline_events', null=True, blank=True)
    
    event_type = models.CharField(max_length=100)
    description = models.TextField()
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='performed_payment_events')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type}"
