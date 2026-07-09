from rest_framework import serializers
from apps.audit.models import AuditLog, LoginHistory, SystemEvent, ApiRequestLog, ErrorLog, ActivityTimeline

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'

class LoginHistorySerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = LoginHistory
        fields = '__all__'

class SystemEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemEvent
        fields = '__all__'

class ApiRequestLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='authenticated_user.email', read_only=True)
    
    class Meta:
        model = ApiRequestLog
        fields = '__all__'

class ErrorLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ErrorLog
        fields = '__all__'

class ActivityTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityTimeline
        fields = '__all__'
