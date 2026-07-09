from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.shipping_views import (
    ShippingCarrierViewSet,
    ShippingMethodViewSet,
    ShipmentViewSet,
    ReturnReasonViewSet,
    ReturnRequestViewSet
)

router = DefaultRouter()
router.register(r'carriers', ShippingCarrierViewSet, basename='shippingcarrier')
router.register(r'methods', ShippingMethodViewSet, basename='shippingmethod')
router.register(r'shipments', ShipmentViewSet, basename='shipment')
router.register(r'return-reasons', ReturnReasonViewSet, basename='returnreason')
router.register(r'returns', ReturnRequestViewSet, basename='returnrequest')

urlpatterns = [
    path('', include(router.urls)),
]
