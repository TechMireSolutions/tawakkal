from django.db.models import Sum, F
from django.utils import timezone
from apps.core.repositories import BaseRepository
from ..models.invoice import Invoice, InvoiceStatus

class InvoiceRepository(BaseRepository):
    model = Invoice

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'order__customer'
        ).prefetch_related(
            'items',
            'allocations',
            'credit_notes'
        )

    @classmethod
    def get_overdue_invoices(cls):
        return cls.get_optimized_queryset().filter(
            status__in=[InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID],
            due_date__lt=timezone.now().date()
        )

    @classmethod
    def get_unpaid_invoices(cls, customer_id=None):
        qs = cls.get_optimized_queryset().filter(
            status__in=[InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]
        )
        if customer_id:
            qs = qs.filter(order__customer_id=customer_id)
        return qs

    @classmethod
    def get_customer_balance(cls, customer_id):
        unpaid = cls.get_unpaid_invoices(customer_id)
        result = unpaid.aggregate(
            total_owed=Sum(F('total_amount') - F('amount_paid'))
        )
        return result['total_owed'] or 0.00
