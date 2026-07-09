from apps.core.repositories import BaseRepository
from ..models.refund import Refund, CreditNote

class RefundRepository(BaseRepository):
    model = Refund

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'payment'
        ).prefetch_related(
            'credit_note'
        )

class CreditNoteRepository(BaseRepository):
    model = CreditNote

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'refund',
            'invoice'
        )
