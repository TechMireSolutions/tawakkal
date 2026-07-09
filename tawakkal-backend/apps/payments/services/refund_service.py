from django.db import transaction
from apps.core.services import BaseService
from ..models.refund import Refund, CreditNote, RefundStatus
from ..repositories.refund_repository import RefundRepository
from .sequence_service import SequenceGeneratorService
from .payment_service import PaymentService
from ..models.payment import PaymentStatus

class RefundService(BaseService):
    repository = RefundRepository

    @classmethod
    @transaction.atomic
    def create_refund(cls, payment, amount, reason, user=None):
        # Validate amount
        if amount > payment.amount:
            raise ValueError("Refund amount cannot exceed payment amount.")
            
        refund = Refund.objects.create(
            payment=payment,
            amount=amount,
            reason=reason,
            status=RefundStatus.COMPLETED
        )
        
        credit_note_number = SequenceGeneratorService.generate("CRN", CreditNote)
        
        # Determine the invoice to credit. For simplicity, just pick the first invoice allocated
        first_allocation = payment.allocations.first()
        invoice = first_allocation.invoice if first_allocation else None
        
        if invoice:
            CreditNote.objects.create(
                credit_note_number=credit_note_number,
                refund=refund,
                invoice=invoice,
                amount=amount,
                reason=reason
            )
            
        # Update payment status
        payment.status = PaymentStatus.REFUNDED if amount == payment.amount else PaymentStatus.PARTIALLY_REFUNDED
        payment.save(update_fields=['status'])
        
        PaymentService._sync_order_payment_status(payment.order)
        
        # Module 15: Notify Refund Issued
        if hasattr(payment.order.customer, 'user') and payment.order.customer.user:
            from apps.notifications.services.notification_service import NotificationService
            NotificationService.dispatch(
                recipient=payment.order.customer.user,
                template_code='REFUND_ISSUED',
                variables={'order_number': payment.order.order_number, 'amount': str(amount), 'customer_name': payment.order.customer.user.first_name},
                related_object=refund,
                sender=user
            )
        
        return refund
