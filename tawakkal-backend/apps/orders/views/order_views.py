from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.mixins import SoftDeleteModelMixin, RestoreModelMixin
from apps.users.permissions import HasModulePermission
from ..models.order import Order
from ..services.order_service import OrderService
from ..serializers.order_serializers import (
    OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer
)

class OrderViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'orders'
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'shipping_status', 'customer']
    search_fields = ['order_number', 'customer__email', 'customer__first_name', 'customer__last_name']
    ordering_fields = ['created_at', 'updated_at', 'total_amount']

    def get_queryset(self):
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        return OrderService.repository.get_optimized_queryset(include_deleted=include_deleted)

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        return OrderDetailSerializer

    def list(self, request, *args, **kwargs):
        from apps.core.utils import format_api_response
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            return format_api_response(success=True, data=paginated_response.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return format_api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # We need to lookup the actual customer and address instances based on the IDs provided
        from apps.customers.models import Customer, CustomerAddress
        
        data = serializer.validated_data
        
        try:
            customer = Customer.objects.get(id=data['customer'])
            shipping_address = CustomerAddress.objects.get(id=data['shipping_address'])
            billing_address = CustomerAddress.objects.get(id=data['billing_address']) if 'billing_address' in data else None
        except (Customer.DoesNotExist, CustomerAddress.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        service_data = {
            'customer': customer,
            'shipping_address': shipping_address,
            'billing_address': billing_address,
            'currency': data.get('currency'),
            'shipping_amount': data.get('shipping_amount'),
            'discount_amount': data.get('discount_amount'),
            'payment_provider': data.get('payment_provider'),
            'payment_reference': data.get('payment_reference'),
            'payment_method': data.get('payment_method'),
        }
        
        order = OrderService.create_order(
            data=service_data,
            items_data=data['items'],
            user=request.user,
            request=request
        )
        
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order = OrderService.update_status(
            order_id=pk,
            new_status=serializer.validated_data['status'],
            user=request.user,
            request=request
        )
        return Response(OrderDetailSerializer(order).data)
