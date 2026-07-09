from django.db.models import Prefetch
from apps.notifications.models import Notification, NotificationTemplate, NotificationPreference, Announcement, NotificationLog

class NotificationRepository:
    @staticmethod
    def get_user_notifications(user):
        return Notification.objects.filter(recipient=user).select_related(
            'sender', 'related_object_type'
        )

    @staticmethod
    def get_unread_count(user):
        return Notification.objects.filter(recipient=user, status='PENDING').count()

    @staticmethod
    def get_all_templates():
        return NotificationTemplate.objects.all()

    @staticmethod
    def get_template_by_code(code):
        return NotificationTemplate.objects.filter(code=code, is_active=True).first()

    @staticmethod
    def get_user_preferences(user):
        pref, _ = NotificationPreference.objects.get_or_create(user=user)
        return pref

    @staticmethod
    def get_active_announcements(user_role='ALL'):
        return Announcement.objects.filter(active=True)

    @staticmethod
    def get_notification_logs(notification_id):
        return NotificationLog.objects.filter(notification_id=notification_id)
