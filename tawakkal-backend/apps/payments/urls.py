from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.payment_views import (
    PaymentMethodViewSet,
    InvoiceViewSet,
    PaymentViewSet,
    RefundViewSet
)

router = DefaultRouter()
router.register(r'payment-methods', PaymentMethodViewSet, basename='paymentmethod')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'refunds', RefundViewSet, basename='refund')

urlpatterns = [
    path('', include(router.urls)),
]
