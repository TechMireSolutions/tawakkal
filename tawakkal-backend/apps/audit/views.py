import csv
import json
from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.users.permissions import HasModulePermission
from apps.core.utils import format_api_response
from apps.audit.models import AuditLog, LoginHistory, SystemEvent, ApiRequestLog, ErrorLog
from apps.audit.serializers import (
    AuditLogSerializer, LoginHistorySerializer, SystemEventSerializer,
    ApiRequestLogSerializer, ErrorLogSerializer
)
from apps.audit.repositories.audit_repository import AuditRepository

class ExportMixin:
    """
    Mixin to support exporting querysets to CSV or JSON.
    """
    def export_data(self, queryset, fields, filename="export"):
        export_type = self.request.query_params.get('export', 'json')
        
        if export_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
            writer = csv.writer(response)
            writer.writerow(fields)
            for obj in queryset:
                row = []
                for field in fields:
                    val = getattr(obj, field, None)
                    if hasattr(val, 'pk'): # Handle foreign keys safely
                        val = val.pk
                    row.append(str(val))
                writer.writerow(row)
            return response
            
        elif export_type == 'json':
            data = []
            for obj in queryset:
                row = {}
                for field in fields:
                    val = getattr(obj, field, None)
                    if hasattr(val, 'pk'):
                        val = str(val.pk)
                    # Simple serialization
                    if hasattr(val, 'isoformat'):
                        val = val.isoformat()
                    row[field] = val
                data.append(row)
            
            from django.core.serializers.json import DjangoJSONEncoder
            response = HttpResponse(json.dumps(data, cls=DjangoJSONEncoder), content_type='application/json')
            response['Content-Disposition'] = f'attachment; filename="{filename}.json"'
            return response
            
        return format_api_response(success=False, message="Invalid export format", status_code=400)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet, ExportMixin):
    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user', 'module', 'action', 'severity', 'entity_type']
    search_fields = ['module', 'entity_id', 'entity_type', 'action']
    ordering_fields = ['created_at']

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        stats = AuditRepository.get_today_statistics()
        return format_api_response(data=stats)
        
    @action(detail=False, methods=['get'])
    def export(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        fields = ['id', 'user_id', 'action', 'module', 'entity_type', 'entity_id', 'severity', 'created_at']
        return self.export_data(queryset, fields, filename="audit_logs")

class LoginHistoryViewSet(viewsets.ReadOnlyModelViewSet, ExportMixin):
    queryset = LoginHistory.objects.all().select_related('user')
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user', 'status', 'action']
    search_fields = ['ip_address', 'browser', 'operating_system']

    @action(detail=False, methods=['get'])
    def export(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        fields = ['id', 'user_id', 'action', 'status', 'ip_address', 'timestamp']
        return self.export_data(queryset, fields, filename="login_history")

class ApiRequestLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ApiRequestLog.objects.all().select_related('authenticated_user')
    serializer_class = ApiRequestLogSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['method', 'response_code', 'authenticated_user']
    search_fields = ['endpoint', 'ip_address']

class ErrorLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ErrorLog.objects.all().select_related('user')
    serializer_class = ErrorLogSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['error_type', 'user']
    search_fields = ['message', 'endpoint']

class SystemEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SystemEvent.objects.all().select_related('triggered_by')
    serializer_class = SystemEventSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event_type', 'status']
