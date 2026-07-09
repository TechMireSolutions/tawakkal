from django.db import models
from apps.core.models import BaseModel
from apps.orders.models import Order
from .method import PaymentMethod
from .invoice import Invoice

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    AUTHORIZED = 'AUTHORIZED', 'Authorized'
    PARTIALLY_PAID = 'PARTIALLY_PAID', 'Partially Paid'
    PAID = 'PAID', 'Paid'
    FAILED = 'FAILED', 'Failed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    REFUND_PENDING = 'REFUND_PENDING', 'Refund Pending'
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED', 'Partially Refunded'
    REFUNDED = 'REFUNDED', 'Refunded'

class Payment(BaseModel):
    payment_number = models.CharField(max_length=50, unique=True, db_index=True)
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='payments', null=True, blank=True)
    
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT, related_name='payments')
    currency = models.CharField(max_length=3, default='USD')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    transaction_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=30, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, db_index=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.payment_number} - {self.status}"

class PaymentAllocation(BaseModel):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='allocations')
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='allocations')
    amount_allocated = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Allocated {self.amount_allocated} from {self.payment.payment_number} to {self.invoice.invoice_number}"
