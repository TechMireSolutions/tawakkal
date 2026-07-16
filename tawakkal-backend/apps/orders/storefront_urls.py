from django.urls import path
from .views.storefront_views import PublicCheckoutView

urlpatterns = [
    path('checkout/', PublicCheckoutView.as_view(), name='storefront-checkout'),
]
