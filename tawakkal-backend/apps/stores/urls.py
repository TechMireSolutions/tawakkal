from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.stores.views.store_views import StoreViewSet, WarehouseViewSet

router = DefaultRouter()
router.register(r'branches', StoreViewSet, basename='store')
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')

urlpatterns = [
    path('', include(router.urls)),
]
