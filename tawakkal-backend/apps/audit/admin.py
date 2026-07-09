from django.contrib import admin
from .models import AuditLog, LoginHistory, SystemEvent, ApiRequestLog, ErrorLog, ActivityTimeline

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'module', 'entity_type')
    search_fields = ('action', 'module', 'entity_type', 'entity_id', 'request_method', 'endpoint', 'severity')
    readonly_fields = ('created_at',)

@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'browser', 'device')
    search_fields = ('action', 'browser', 'device', 'operating_system', 'status')
    list_filter = ('timestamp',)
    readonly_fields = ()

@admin.register(SystemEvent)
class SystemEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_type', 'description', 'status', 'triggered_by')
    search_fields = ('event_type', 'status')
    list_filter = ('timestamp',)
    readonly_fields = ()

@admin.register(ApiRequestLog)
class ApiRequestLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'endpoint', 'method', 'response_code', 'execution_time')
    search_fields = ('endpoint', 'method')
    list_filter = ('timestamp',)
    readonly_fields = ()

@admin.register(ErrorLog)
class ErrorLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'error_type', 'message', 'traceback', 'user')
    search_fields = ('error_type', 'endpoint')
    list_filter = ('timestamp',)
    readonly_fields = ()

@admin.register(ActivityTimeline)
class ActivityTimelineAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'description', 'module', 'entity_id')
    search_fields = ('description', 'module', 'entity_id')
    list_filter = ('timestamp',)
    readonly_fields = ()

