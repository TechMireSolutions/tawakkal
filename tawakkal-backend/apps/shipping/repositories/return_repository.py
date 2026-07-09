from apps.core.repositories import BaseRepository
from ..models.returns import ReturnRequest, ReturnItem, ReturnReason

class ReturnRequestRepository(BaseRepository):
    model = ReturnRequest

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'order'
        ).prefetch_related(
            'items',
            'items__reason',
            'items__shipment_item'
        )

class ReturnReasonRepository(BaseRepository):
    model = ReturnReason
    
    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted)
