from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.mixins import SoftDeleteModelMixin, RestoreModelMixin
from apps.users.permissions import HasModulePermission
from apps.catalog.models.badge import Badge
from apps.catalog.serializers.badge_serializers import BadgeSerializer
from apps.core.utils import format_api_response

class BadgeViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'catalog'
    serializer_class = BadgeSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'slug']
    ordering_fields = ['priority', 'display_order', 'name', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [perm() for perm in self.permission_classes]

    def get_queryset(self):
        qs = Badge.objects.all() if self.request.user.is_authenticated else Badge.objects.filter(status=True)
        return qs

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

    def perform_destroy(self, instance):
        instance.soft_delete()
