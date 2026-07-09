from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from apps.core.mixins import SoftDeleteModelMixin, RestoreModelMixin
from apps.users.permissions import HasModulePermission
from apps.orders.models.order import Order

from ..models.carrier import ShippingCarrier, ShippingMethod
from ..models.returns import ReturnReason
from ..services.shipment_service import ShipmentService
from ..services.return_service import ReturnService

from ..serializers.shipping_serializers import (
    ShippingCarrierSerializer,
    ShippingMethodSerializer,
    ShipmentSerializer,
    CreateShipmentSerializer,
    UpdateShipmentStatusSerializer,
    ReturnReasonSerializer,
    ReturnRequestSerializer,
    CreateReturnRequestSerializer,
    UpdateReturnStatusSerializer
)

class ShippingCarrierViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'shipping'
    queryset = ShippingCarrier.all_objects.all()
    serializer_class = ShippingCarrierSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code']

class ShippingMethodViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'shipping'
    queryset = ShippingMethod.all_objects.all()
    serializer_class = ShippingMethodSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'carrier']
    search_fields = ['name', 'code']

class ShipmentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'shipping'
    serializer_class = ShipmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'order', 'carrier', 'shipping_method']
    search_fields = ['shipment_number', 'tracking_number']
    ordering_fields = ['created_at', 'estimated_delivery', 'shipped_at']

    def get_queryset(self):
        return ShipmentService.repository.get_optimized_queryset()

    @action(detail=False, methods=['post'])
    def create_shipment(self, request):
        serializer = CreateShipmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        order = get_object_or_404(Order, id=data['order_id'])
        
        shipment = ShipmentService.create_shipment(
            order=order,
            items_data=data['items'],
            user=request.user,
            carrier_id=data.get('carrier_id'),
            shipping_method_id=data.get('shipping_method_id')
        )
        
        return Response(ShipmentSerializer(shipment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        serializer = UpdateShipmentStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        shipment = ShipmentService.update_status(
            shipment_id=pk,
            new_status=serializer.validated_data['status'],
            user=request.user,
            tracking_number=serializer.validated_data.get('tracking_number'),
            label_url=serializer.validated_data.get('label_url')
        )
        
        return Response(ShipmentSerializer(shipment).data, status=status.HTTP_200_OK)

class ReturnReasonViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'shipping'
    queryset = ReturnReason.all_objects.all()
    serializer_class = ReturnReasonSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['code', 'description']

class ReturnRequestViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'shipping'
    serializer_class = ReturnRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'order']
    search_fields = ['return_number']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return ReturnService.repository.get_optimized_queryset()

    @action(detail=False, methods=['post'])
    def request_return(self, request):
        serializer = CreateReturnRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        order = get_object_or_404(Order, id=data['order_id'])
        
        return_req = ReturnService.create_return_request(
            order=order,
            items_data=data['items'],
            notes=data.get('notes', ''),
            user=request.user
        )
        
        return Response(ReturnRequestSerializer(return_req).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        serializer = UpdateReturnStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        return_req = ReturnService.update_status(
            return_id=pk,
            new_status=serializer.validated_data['status'],
            user=request.user
        )
        
        return Response(ReturnRequestSerializer(return_req).data, status=status.HTTP_200_OK)
