from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import HasModulePermission
from apps.core.utils import format_api_response
from apps.notifications.models import Notification, NotificationTemplate, NotificationPreference, Announcement
from apps.notifications.serializers import (
    NotificationSerializer, NotificationTemplateSerializer,
    NotificationPreferenceSerializer, AnnouncementSerializer
)
from apps.notifications.services.notification_service import NotificationService
from apps.notifications.services.announcement_service import AnnouncementService
from apps.notifications.repositories.notification_repository import NotificationRepository
from apps.notifications.services.template_service import TemplateService

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    
    def get_queryset(self):
        # Users see their own notifications, admins see all (simplification, real implementation might vary)
        if self.request.user.is_staff:
            return Notification.objects.all()
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notif = NotificationService.mark_as_read(pk, request.user)
        if notif:
            return format_api_response(message="Marked as read", data=NotificationSerializer(notif).data)
        return format_api_response(success=False, message="Notification not found", status_code=404)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        NotificationService.mark_all_as_read(request.user)
        return format_api_response(message="All marked as read")

    @action(detail=True, methods=['post'], url_path='send')
    def send_notification(self, request, pk=None):
        success = NotificationService.send_notification(pk)
        return format_api_response(success=success, message="Sent" if success else "Failed")

class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]

    @action(detail=True, methods=['post'], url_path='preview')
    def preview(self, request, pk=None):
        template = self.get_object()
        variables = request.data.get('variables', {})
        rendered = TemplateService.render_template(template, variables)
        return format_api_response(data=rendered)

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationPreference.objects.filter(user=self.request.user)
        
    def get_object(self):
        return NotificationRepository.get_user_preferences(self.request.user)
        
    def list(self, request, *args, **kwargs):
        # We only really have one preference per user
        pref = self.get_object()
        serializer = self.get_serializer(pref)
        return format_api_response(data=serializer.data)

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    
    @action(detail=True, methods=['post'], url_path='expire')
    def expire(self, request, pk=None):
        announcement = AnnouncementService.expire_announcement(pk)
        return format_api_response(data=AnnouncementSerializer(announcement).data)
