from rest_framework import viewsets, permissions
from apps.orders.models import SalesEmployee
from apps.orders.serializers.sales_employee_serializers import SalesEmployeeSerializer

class SalesEmployeeViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing Sales Employees.
    """
    queryset = SalesEmployee.objects.all()
    serializer_class = SalesEmployeeSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    # Optional: add search and ordering
    # filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    # search_fields = ['first_name', 'last_name', 'coupon_code']
    # ordering_fields = ['created_at', 'first_name', 'total_orders']
