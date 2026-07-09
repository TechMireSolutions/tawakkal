from rest_framework import serializers
from apps.notifications.models import (
    Notification, NotificationTemplate, NotificationPreference,
    Announcement, NotificationLog, NotificationTimeline
)

class NotificationTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTimeline
        fields = '__all__'

class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    timeline = NotificationTimelineSerializer(many=True, read_only=True)
    logs = NotificationLogSerializer(many=True, read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['notification_number', 'sender', 'status', 'sent_at', 'read_at', 'failed_at']

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ['user']

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
