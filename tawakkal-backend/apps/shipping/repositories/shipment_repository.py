from apps.core.repositories import BaseRepository
from ..models.shipment import Shipment, ShipmentItem
from ..models.carrier import ShippingCarrier, ShippingMethod

class ShipmentRepository(BaseRepository):
    model = Shipment

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'order',
            'carrier',
            'shipping_method'
        ).prefetch_related(
            'items'
        )

class ShipmentItemRepository(BaseRepository):
    model = ShipmentItem

    @classmethod
    def get_optimized_queryset(cls, include_deleted=False):
        return cls.get_queryset(include_deleted).select_related(
            'shipment',
            'order_item'
        )
