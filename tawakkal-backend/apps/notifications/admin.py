from django.contrib import admin
from .models import *

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'notification_number', 'recipient', 'sender', 'title', 'message', 'created_at', 'is_deleted'])
    search_fields = tuple(['notification_number', 'title', 'notification_type', 'channel'])
    list_filter = tuple(['is_deleted', 'recipient__id', 'sender__id', 'related_object_type__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'code', 'subject', 'html', 'plain_text', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'code', 'subject', 'channel'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'email_enabled', 'sms_enabled', 'push_enabled', 'in_app_enabled', 
        'marketing_enabled', 'order_updates', 'shipping_updates', 'payment_updates', 
        'refund_updates', 'survey_updates', 'announcements_enabled', 'security_updates'
    )
    search_fields = ('user__email',)
    list_filter = (
        'email_enabled', 'sms_enabled', 'push_enabled', 'in_app_enabled', 
        'marketing_enabled', 'order_updates', 'shipping_updates', 'payment_updates'
    )

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'title', 'message', 'audience', 'priority', 'start_date', 'created_at', 'is_deleted'])
    search_fields = tuple(['title', 'audience', 'priority'])
    list_filter = tuple(['is_deleted', 'active', 'dismissible'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'notification', 'provider', 'request_payload', 'response_payload', 'status', 'created_at', 'is_deleted'])
    search_fields = tuple(['provider', 'status'])
    list_filter = tuple(['is_deleted', 'notification__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(NotificationTimeline)
class NotificationTimelineAdmin(admin.ModelAdmin):
    list_display = ('notification', 'event_type', 'description', 'performed_by', 'created_at')
    search_fields = ('notification__notification_number', 'event_type')
    list_filter = ('event_type',)
