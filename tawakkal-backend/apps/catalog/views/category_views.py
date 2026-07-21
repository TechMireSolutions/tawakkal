from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema

from apps.core.mixins import SoftDeleteModelMixin, RestoreModelMixin
from apps.core.utils import format_api_response
from apps.users.permissions import HasModulePermission

from ..models.category import Category
from ..services.category_service import CategoryService
from ..serializers.category_serializers import (
    CategoryListSerializer, 
    CategoryDetailSerializer, 
    CategoryCreateUpdateSerializer, 
    CategoryTreeSerializer
)

class CategoryViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    """
    ViewSet for Category management.
    """
    permission_classes = [IsAuthenticated, HasModulePermission]
    service_class = CategoryService
    module_name = 'catalog'
    
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'slug', 'seo_title', 'seo_keywords']
    ordering_fields = ['display_order', 'created_at', 'updated_at', 'name']
    # product_count will be added to ordering_fields when Product is implemented
    
    def get_permissions(self):
        # Allow anonymous users to view categories on the public site
        if self.action in ['list', 'retrieve', 'tree', 'flat']:
            return [AllowAny()]
        return [perm() for perm in self.permission_classes]

    def get_queryset(self):
        return self.service_class.repository().get_queryset()

    def get_serializer_class(self):
        if self.action == 'tree':
            return CategoryTreeSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return CategoryCreateUpdateSerializer
        if self.action == 'retrieve':
            return CategoryDetailSerializer
        return CategoryListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            return format_api_response(success=True, data=paginated_response.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return format_api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return format_api_response(success=True, data=serializer.data)

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ValidationError as e:
            return format_api_response(
                success=False,
                message="Validation Error",
                errors=list(e.messages) if hasattr(e, 'messages') else str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                instance = self.service_class.create(
                    user=request.user,
                    request=request,
                    **serializer.validated_data
                )
                res_serializer = CategoryDetailSerializer(instance, context={'request': request})
                return format_api_response(
                    success=True,
                    message="Category created successfully.",
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

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            try:
                updated_instance = self.service_class.update(
                    instance,
                    user=request.user,
                    request=request,
                    **serializer.validated_data
                )
                res_serializer = CategoryDetailSerializer(updated_instance, context={'request': request})
                return format_api_response(
                    success=True,
                    message="Category updated successfully.",
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

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Return the category hierarchy as a tree."""
        # Using a custom prefetch utility or just rely on the serializer
        roots = self.service_class.repository().get_root_categories()
        # In a real heavy tree, we might fetch all and build in memory, but for now this works.
        serializer = self.get_serializer(roots, many=True)
        return format_api_response(success=True, data=serializer.data)

    @action(detail=False, methods=['get'])
    def flat(self, request):
        """Return all categories in a flat list ordered by path."""
        queryset = self.service_class.repository().get_flat()
        serializer = CategoryListSerializer(queryset, many=True, context={'request': request})
        return format_api_response(success=True, data=serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return format_api_response(success=False, message="No IDs provided", status_code=status.HTTP_400_BAD_REQUEST)
        try:
            self.service_class.bulk_delete(ids, user=request.user, request=request)
            return format_api_response(success=True, message=f"{len(ids)} categories deleted.")
        except Exception as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def bulk_restore(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return format_api_response(success=False, message="No IDs provided", status_code=status.HTTP_400_BAD_REQUEST)
        try:
            self.service_class.bulk_restore(ids, user=request.user, request=request)
            return format_api_response(success=True, message=f"{len(ids)} categories restored.")
        except Exception as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def bulk_status(self, request):
        ids = request.data.get('ids', [])
        status_val = request.data.get('status')
        if not ids or status_val is None:
            return format_api_response(success=False, message="IDs and status are required", status_code=status.HTTP_400_BAD_REQUEST)
        try:
            self.service_class.bulk_status_change(ids, status_val, user=request.user, request=request)
            return format_api_response(success=True, message=f"{len(ids)} categories status updated.")
        except Exception as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def bulk_reorder(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return format_api_response(success=False, message="No IDs provided", status_code=status.HTTP_400_BAD_REQUEST)
        try:
            self.service_class.bulk_reorder(ids, user=request.user, request=request)
            return format_api_response(success=True, message="Categories reordered successfully.")
        except Exception as e:
            return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
