from apps.core.repositories import BaseRepository
from ..models.payment import Payment, PaymentAllocation

class PaymentRepository(BaseRepository):
    model = Payment

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'order',
            'payment_method'
        ).prefetch_related(
            'allocations',
            'refunds'
        )

class PaymentAllocationRepository(BaseRepository):
    model = PaymentAllocation

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'payment',
            'invoice'
        )
