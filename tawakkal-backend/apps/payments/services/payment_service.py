from django.db import transaction
from django.core.exceptions import ValidationError
from apps.core.services import BaseService
from ..models.payment import Payment, PaymentAllocation, PaymentStatus
from ..repositories.payment_repository import PaymentRepository
from .sequence_service import SequenceGeneratorService
from .invoice_service import InvoiceService
from apps.orders.models.order import PaymentStatus as OrderPaymentStatus

class PaymentService(BaseService):
    repository = PaymentRepository

    @classmethod
    @transaction.atomic
    def process_payment(cls, order, payment_method, amount, transaction_id="", user=None):
        payment_number = SequenceGeneratorService.generate("PAY", Payment)
        
        payment = Payment.objects.create(
            payment_number=payment_number,
            order=order,
            payment_method=payment_method,
            currency=order.currency,
            amount=amount,
            transaction_id=transaction_id,
            status=PaymentStatus.PAID
        )
        
        # Auto-allocate to unpaid invoices for this order
        cls.allocate_payment(payment, user)
        cls._sync_order_payment_status(order)
        
        # Module 15: Notify Payment Received
        if hasattr(order.customer, 'user') and order.customer.user:
            from apps.notifications.services.notification_service import NotificationService
            NotificationService.dispatch(
                recipient=order.customer.user,
                template_code='PAYMENT_RECEIVED',
                variables={'order_number': order.order_number, 'amount': str(amount), 'customer_name': order.customer.user.first_name},
                related_object=payment,
                sender=user
            )
        
        return payment

    @classmethod
    @transaction.atomic
    def allocate_payment(cls, payment, user=None):
        remaining = payment.amount
        invoices = payment.order.invoices.filter(status__in=['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'OVERDUE']).order_by('created_at')
        
        for invoice in invoices:
            if remaining <= 0:
                break
                
            amount_needed = invoice.total_amount - invoice.amount_paid
            if amount_needed > 0:
                allocation_amount = min(remaining, amount_needed)
                
                PaymentAllocation.objects.create(
                    payment=payment,
                    invoice=invoice,
                    amount_allocated=allocation_amount
                )
                
                invoice.amount_paid += allocation_amount
                invoice.save()
                
                # Update invoice status
                if invoice.status == 'DRAFT':
                    InvoiceService.issue_invoice(invoice.id, user)
                InvoiceService.update_invoice_status(invoice.id)
                
                remaining -= allocation_amount

    @classmethod
    def _sync_order_payment_status(cls, order):
        total_paid = sum(p.amount for p in order.payments.filter(status=PaymentStatus.PAID))
        
        if total_paid >= order.total_amount:
            order.payment_status = OrderPaymentStatus.PAID
        elif total_paid > 0:
            order.payment_status = OrderPaymentStatus.PARTIALLY_PAID
        else:
            order.payment_status = OrderPaymentStatus.UNPAID
            
        order.save(update_fields=['payment_status'])
