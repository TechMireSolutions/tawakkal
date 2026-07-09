from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from apps.core.mixins import SoftDeleteModelMixin, RestoreModelMixin
from apps.core.utils import format_api_response
from apps.users.permissions import HasModulePermission

from ..services.product_service import ProductService
from ..serializers.product_serializers import (
    ProductListSerializer, 
    ProductDetailSerializer, 
    ProductCreateSerializer, 
    ProductUpdateSerializer
)

class ProductViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    """
    ViewSet for Product management in the ERP engine.
    """
    permission_classes = [IsAuthenticated, HasModulePermission]
    service_class = ProductService
    module_name = 'catalog'
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_featured', 'category_id', 'brand']
    search_fields = ['name', 'slug', 'seo_title', 'seo_keywords', 'description', 'variants__sku']
    ordering_fields = ['created_at', 'updated_at', 'name', 'base_price']
    
    def get_permissions(self):
        # Allow anonymous users to view product list and detail on the public site
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [perm() for perm in self.permission_classes]

    def get_queryset(self):
        from apps.catalog.repositories.product_repository import ProductRepository
        qs = ProductRepository.get_optimized_queryset()
        if not self.request.user.is_authenticated:
            qs = qs.filter(status='ACTIVE')
            
        # Custom Multi-Filter Engine
        query_params = self.request.query_params
        
        brands = query_params.getlist('brand')
        if not brands and 'brand' in query_params:
            brands = [query_params.get('brand')]
            
        categories = query_params.getlist('category')
        if not categories and 'category' in query_params:
            categories = [query_params.get('category')]
            
        badges = query_params.getlist('badge')
        if not badges and 'badge' in query_params:
            badges = [query_params.get('badge')]
            
        if brands and brands[0]:
            # Can be slugs or ids
            brands_clean = [b for b in brands if b]
            qs = qs.filter(brand__slug__in=brands_clean) | qs.filter(brand__id__in=brands_clean)
            
        if categories and categories[0]:
            categories_clean = [c for c in categories if c]
            qs = qs.filter(category__slug__in=categories_clean) | qs.filter(category__id__in=categories_clean)
            
        if badges and badges[0]:
            badges_clean = [b for b in badges if b]
            for b in badges_clean:
                qs = qs.filter(badges__slug=b) | qs.filter(badges__id=b)

        return qs.distinct()

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ProductUpdateSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @extend_schema(responses={200: ProductListSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Custom filtering for low_stock
        low_stock = request.query_params.get('low_stock')
        if low_stock and low_stock.lower() == 'true':
            # Rely on repository low_stock implementation
            from apps.catalog.repositories.product_repository import ProductRepository
            # Since repository low_stock uses the base queryset, we need to apply it on top of our filtered qs
            queryset = queryset.filter(stock__lte=models.F('low_stock_threshold'))

        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            return format_api_response(success=True, data=paginated_response.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return format_api_response(success=True, data=serializer.data)

    @extend_schema(responses={200: ProductDetailSerializer})
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return format_api_response(success=True, data=serializer.data)

    @extend_schema(request=ProductCreateSerializer, responses={201: ProductDetailSerializer})
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                validated_data = serializer.validated_data
                variants_data = validated_data.pop('variants', [])
                
                instance = self.service_class.create_product(
                    product_data=validated_data,
                    variants_data=variants_data,
                    user=request.user
                )
                res_serializer = ProductDetailSerializer(instance, context={'request': request})
                return format_api_response(
                    success=True,
                    message="Product created successfully.",
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
        if not serializer.is_valid():
            print("INVALID DATA PAYLOAD:", request.data)
            print("SERIALIZER ERRORS:", serializer.errors)
        return format_api_response(
            success=False, message="Invalid data", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(request=ProductUpdateSerializer, responses={200: ProductDetailSerializer})
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
        
        if serializer.is_valid():
            try:
                updated_instance = self.service_class.update_product(
                    product_id=instance.id,
                    product_data=serializer.validated_data,
                    user=request.user
                )
                res_serializer = ProductDetailSerializer(updated_instance, context={'request': request})
                return format_api_response(
                    success=True,
                    message="Product updated successfully.",
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
    def duplicate(self, request, pk=None):
        try:
            new_product = self.service_class.duplicate_product(pk, user=request.user)
            res_serializer = ProductDetailSerializer(new_product, context={'request': request})
            return format_api_response(
                success=True,
                message="Product duplicated successfully.",
                data=res_serializer.data,
                status_code=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        try:
            archived = self.service_class.archive_product(pk, user=request.user)
            return format_api_response(success=True, message=f"Product {archived.sku if hasattr(archived, 'sku') else archived.name} archived.")
        except ValidationError as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
