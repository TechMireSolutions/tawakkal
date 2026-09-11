from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.order_views import OrderViewSet
from .views.admin_sales_employee_views import SalesEmployeeViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'sales-employees', SalesEmployeeViewSet, basename='sales-employee')

urlpatterns = [
    path('', include(router.urls)),
]
