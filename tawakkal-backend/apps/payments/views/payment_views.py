from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from apps.core.mixins import SoftDeleteModelMixin, RestoreModelMixin
from apps.users.permissions import HasModulePermission
from apps.orders.models.order import Order

from ..models.method import PaymentMethod
from ..models.invoice import Invoice
from ..models.payment import Payment
from ..models.refund import Refund

from ..services.payment_service import PaymentService
from ..repositories.invoice_repository import InvoiceRepository

from ..serializers.payment_serializers import (
    PaymentMethodSerializer,
    InvoiceSerializer,
    PaymentSerializer,
    ProcessPaymentSerializer,
    RefundSerializer
)

class PaymentMethodViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'payments'
    queryset = PaymentMethod.all_objects.all()
    serializer_class = PaymentMethodSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'provider']
    search_fields = ['name', 'provider']

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'payments'
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'order', 'order__customer']
    search_fields = ['invoice_number', 'order__order_number']
    ordering_fields = ['created_at', 'issue_date', 'due_date', 'total_amount']

    def get_queryset(self):
        return InvoiceRepository.get_optimized_queryset()

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'payments'
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'order', 'payment_method']
    search_fields = ['payment_number', 'transaction_id']
    ordering_fields = ['created_at', 'amount']

    def get_queryset(self):
        return PaymentService.repository.get_optimized_queryset()

    @action(detail=False, methods=['post'])
    def process_payment(self, request):
        serializer = ProcessPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        order = get_object_or_404(Order, id=data['order_id'])
        payment_method = get_object_or_404(PaymentMethod, id=data['payment_method_id'])
        
        payment = PaymentService.process_payment(
            order=order,
            payment_method=payment_method,
            amount=data['amount'],
            transaction_id=data.get('transaction_id', ''),
            user=request.user
        )
        
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

class RefundViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'payments'
    serializer_class = RefundSerializer
    queryset = Refund.all_objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment']
    ordering_fields = ['created_at']
