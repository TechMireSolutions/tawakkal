import uuid
from django.db import models
from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_logs')
    action = models.CharField(max_length=50, db_index=True)
    module = models.CharField(max_length=50, db_index=True)
    entity_type = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=255, db_index=True)
    old_values = models.JSONField(null=True, blank=True, encoder=DjangoJSONEncoder)
    new_values = models.JSONField(null=True, blank=True, encoder=DjangoJSONEncoder)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    request_method = models.CharField(max_length=20, null=True, blank=True)
    endpoint = models.CharField(max_length=255, null=True, blank=True)
    severity = models.CharField(max_length=20, default='INFO', db_index=True) # INFO, WARNING, CRITICAL
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

class LoginHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='login_history')
    action = models.CharField(max_length=50) # LOGIN, LOGOUT, FAILED_LOGIN, PASSWORD_RESET, TOKEN_REFRESH
    browser = models.CharField(max_length=255, null=True, blank=True)
    device = models.CharField(max_length=255, null=True, blank=True)
    operating_system = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=20) # SUCCESS, FAILED

    class Meta:
        ordering = ['-timestamp']

class SystemEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=100) # SCHEDULED_TASK, IMPORT, EXPORT, BACKUP, RESTORE, MAINTENANCE
    description = models.TextField()
    status = models.CharField(max_length=20) # STARTED, COMPLETED, FAILED
    triggered_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

class ApiRequestLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    endpoint = models.CharField(max_length=255, db_index=True)
    method = models.CharField(max_length=20)
    response_code = models.IntegerField(db_index=True)
    execution_time = models.FloatField() # in seconds
    authenticated_user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    request_size = models.IntegerField(null=True, blank=True)
    response_size = models.IntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

class ErrorLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    error_type = models.CharField(max_length=100) # UNHANDLED_EXCEPTION, VALIDATION_FAILURE, PERMISSION_DENIAL, DATABASE_ERROR
    message = models.TextField()
    traceback = models.TextField(null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    endpoint = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

class ActivityTimeline(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    description = models.CharField(max_length=255)
    module = models.CharField(max_length=50)
    entity_id = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
