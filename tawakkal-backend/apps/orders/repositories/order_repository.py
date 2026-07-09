from apps.core.repositories import BaseRepository
from ..models.order import Order

class OrderRepository(BaseRepository):
    model = Order

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'customer',
            'shipping_address',
            'billing_address',
        ).prefetch_related(
            'items__variant__product',
            'timeline_events',
            'internal_notes',
        )
