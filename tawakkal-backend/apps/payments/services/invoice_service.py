from django.db import transaction
from django.utils import timezone
from apps.core.services import BaseService
from ..models.invoice import Invoice, InvoiceItem, InvoiceStatus
from ..repositories.invoice_repository import InvoiceRepository
from .sequence_service import SequenceGeneratorService

class InvoiceService(BaseService):
    repository = InvoiceRepository

    @classmethod
    @transaction.atomic
    def create_invoice(cls, order, user=None):
        invoice_number = SequenceGeneratorService.generate("INV", Invoice)
        
        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            order=order,
            currency=order.currency,
            subtotal=order.total_amount - order.tax_amount - order.shipping_amount + order.discount_amount,
            tax_amount=order.tax_amount,
            discount_amount=order.discount_amount,
            shipping_amount=order.shipping_amount,
            total_amount=order.total_amount,
            status=InvoiceStatus.DRAFT
        )
        
        for item in order.items.all():
            InvoiceItem.objects.create(
                invoice=invoice,
                product_name=item.product_name,
                sku=item.sku,
                quantity=item.quantity,
                unit_price=item.unit_price,
                discount_amount=item.discount_amount,
                tax_amount=item.tax_amount,
                subtotal=item.unit_price * item.quantity,
                total=item.total_price
            )
            
        return invoice

    @classmethod
    @transaction.atomic
    def issue_invoice(cls, invoice_id, user=None):
        invoice = cls.repository.get_by_id(invoice_id)
        if invoice.status == InvoiceStatus.DRAFT:
            invoice.status = InvoiceStatus.ISSUED
            invoice.issue_date = timezone.now().date()
            # Default due date 30 days
            invoice.due_date = invoice.issue_date + timezone.timedelta(days=30)
            invoice.save()
        return invoice

    @classmethod
    @transaction.atomic
    def update_invoice_status(cls, invoice_id):
        """Called automatically after payment allocations."""
        invoice = cls.repository.get_by_id(invoice_id)
        
        if invoice.amount_paid >= invoice.total_amount:
            invoice.status = InvoiceStatus.PAID
        elif invoice.amount_paid > 0:
            invoice.status = InvoiceStatus.PARTIALLY_PAID
            
        invoice.save()
        return invoice
