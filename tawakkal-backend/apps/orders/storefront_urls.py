from django.urls import path
from .views.storefront_views import PublicCheckoutView, CouponValidateView

urlpatterns = [
    path('checkout/', PublicCheckoutView.as_view(), name='storefront-checkout'),
    path('coupon/validate/', CouponValidateView.as_view(), name='storefront-coupon-validate'),
]
