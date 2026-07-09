from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema

from apps.core.mixins import SoftDeleteModelMixin, RestoreModelMixin
from apps.core.utils import format_api_response
from apps.users.permissions import HasModulePermission

from ..services.customer_service import CustomerService
from ..services.tag_service import CustomerTagService
from ..serializers.customer_serializers import (
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerCreateSerializer,
    CustomerUpdateSerializer,
    CustomerTagSerializer,
    CustomerNoteSerializer
)

class CustomerViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    """
    ViewSet for Customer ERP management.
    """
    permission_classes = [IsAuthenticated, HasModulePermission]
    service_class = CustomerService
    module_name = 'customers'
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'tier', 'gender', 'accepts_marketing']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'customer_code', 'company_name']
    ordering_fields = ['created_at', 'updated_at', 'first_name', 'last_name', 'loyalty_points']

    def get_queryset(self):
        return self.service_class.repository().with_order_statistics()

    def get_serializer_class(self):
        if self.action == 'create':
            return CustomerCreateSerializer
        if self.action in ['update', 'partial_update']:
            return CustomerUpdateSerializer
        if self.action == 'retrieve':
            return CustomerDetailSerializer
        return CustomerListSerializer

    @extend_schema(responses={200: CustomerListSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            return format_api_response(success=True, data=paginated_response.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return format_api_response(success=True, data=serializer.data)

    @extend_schema(responses={200: CustomerDetailSerializer})
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return format_api_response(success=True, data=serializer.data)

    @extend_schema(request=CustomerCreateSerializer, responses={201: CustomerDetailSerializer})
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                instance = self.service_class.create_customer(
                    data=serializer.validated_data,
                    user=request.user,
                    request=request
                )
                res_serializer = CustomerDetailSerializer(instance, context={'request': request})
                return format_api_response(
                    success=True,
                    message="Customer created successfully.",
                    data=res_serializer.data,
                    status_code=status.HTTP_201_CREATED
                )
            except ValidationError as e:
                return format_api_response(
                    success=False,
                    message="Validation Error",
                    errors=list(e.messages) if hasattr(e, 'messages') else str(e),
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        return format_api_response(
            success=False, message="Invalid data", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(request=CustomerUpdateSerializer, responses={200: CustomerDetailSerializer})
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
        
        if serializer.is_valid():
            try:
                updated_instance = self.service_class.update_customer(
                    customer=instance,
                    data=serializer.validated_data,
                    user=request.user,
                    request=request
                )
                res_serializer = CustomerDetailSerializer(updated_instance, context={'request': request})
                return format_api_response(
                    success=True,
                    message="Customer updated successfully.",
                    data=res_serializer.data
                )
            except ValidationError as e:
                return format_api_response(
                    success=False,
                    message="Validation Error",
                    errors=list(e.messages) if hasattr(e, 'messages') else str(e),
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        return format_api_response(
            success=False, message="Invalid data", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        reason = request.data.get('reason', 'Admin block')
        try:
            customer = self.service_class.block_customer(pk, reason, user=request.user, request=request)
            return format_api_response(success=True, message=f"Customer {customer.customer_code} blocked.")
        except Exception as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        try:
            customer = self.service_class.unblock_customer(pk, user=request.user, request=request)
            return format_api_response(success=True, message=f"Customer {customer.customer_code} unblocked.")
        except Exception as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        text = request.data.get('text')
        if not text:
            return format_api_response(success=False, message="Text is required.", status_code=status.HTTP_400_BAD_REQUEST)
        try:
            note = self.service_class.add_note(pk, text, user=request.user, request=request)
            return format_api_response(success=True, message="Note added.", data=CustomerNoteSerializer(note).data)
        except Exception as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer Tag CRUD.
    """
    permission_classes = [IsAuthenticated, HasModulePermission]
    service_class = CustomerTagService
    module_name = 'customers'
    serializer_class = CustomerTagSerializer
    
    def get_queryset(self):
        return self.service_class.repository().get_optimized_queryset()
