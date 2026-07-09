from django.db import models
from apps.core.models import BaseModel
from .payment import Payment
from .invoice import Invoice

class RefundStatus(models.TextChoices):
    REQUESTED = 'REQUESTED', 'Requested'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    PROCESSING = 'PROCESSING', 'Processing'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Refund(BaseModel):
    payment = models.ForeignKey(Payment, on_delete=models.PROTECT, related_name='refunds')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=RefundStatus.choices, default=RefundStatus.REQUESTED)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Refund for {self.payment.payment_number} - {self.status}"

class CreditNote(BaseModel):
    credit_note_number = models.CharField(max_length=50, unique=True, db_index=True)
    refund = models.OneToOneField(Refund, on_delete=models.PROTECT, related_name='credit_note')
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name='credit_notes')
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    issue_date = models.DateField(auto_now_add=True)
    reason = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.credit_note_number
