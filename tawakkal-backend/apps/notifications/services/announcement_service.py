from django.utils import timezone
from apps.notifications.models import Announcement, AnnouncementAudience

class AnnouncementService:
    @staticmethod
    def publish_announcement(data, user):
        announcement = Announcement.objects.create(
            title=data['title'],
            message=data['message'],
            audience=data.get('audience', AnnouncementAudience.ALL),
            priority=data.get('priority', 'NORMAL'),
            start_date=data.get('start_date', timezone.now()),
            end_date=data.get('end_date'),
            active=True,
            dismissible=data.get('dismissible', True)
        )
        # We could potentially bulk-create notifications here depending on audience,
        # or just leave it as an announcement entity that the frontend fetches.
        # The prompt says "Announcement: System-wide broadcasts with audience filtering. CMS: Announcements should be consumable by the CMS/front page if required."
        return announcement

    @staticmethod
    def expire_announcement(announcement_id):
        announcement = Announcement.objects.get(id=announcement_id)
        announcement.active = False
        announcement.end_date = timezone.now()
        announcement.save(update_fields=['active', 'end_date'])
        return announcement
