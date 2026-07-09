import uuid
from django.db import transaction
from django.utils import timezone
from apps.notifications.models import (
    Notification, NotificationStatus, NotificationLog, NotificationTimeline,
    NotificationChannel, NotificationType, NotificationPriority
)
from apps.notifications.repositories.notification_repository import NotificationRepository
from apps.notifications.services.template_service import TemplateService
from apps.notifications.services.providers import ProviderFactory

class NotificationService:
    @staticmethod
    def _generate_notification_number():
        count = Notification.objects.count()
        return f"NOTIF-{count + 1:07d}"

    @staticmethod
    def check_preference(user, channel, notif_type):
        pref = NotificationRepository.get_user_preferences(user)
        
        # Check channel first
        if channel == NotificationChannel.EMAIL and not pref.email_enabled:
            return False
        if channel == NotificationChannel.SMS and not pref.sms_enabled:
            return False
        if channel == NotificationChannel.PUSH and not pref.push_enabled:
            return False
        if channel == NotificationChannel.IN_APP and not pref.in_app_enabled:
            return False
            
        # Check type
        if notif_type == NotificationType.MARKETING and not pref.marketing_enabled:
            return False
        if notif_type == NotificationType.ORDER and not pref.order_updates:
            return False
        if notif_type == NotificationType.SHIPPING and not pref.shipping_updates:
            return False
        if notif_type == NotificationType.PAYMENT and not pref.payment_updates:
            return False
        if notif_type == NotificationType.REFUND and not pref.refund_updates:
            return False
        if notif_type == NotificationType.SURVEY and not pref.survey_updates:
            return False
        if notif_type == NotificationType.SYSTEM and not pref.announcements_enabled:
            return False
            
        # Security is always enabled unless explicitly disabled, but we check anyway
        if notif_type == NotificationType.SECURITY and not pref.security_updates:
            return False
            
        return True

    @staticmethod
    @transaction.atomic
    def dispatch(recipient, template_code, variables, related_object=None, sender=None, scheduled_at=None):
        """
        Main entry point for dispatching a notification.
        Finds the template, evaluates preferences, creates the notification, and triggers delivery.
        """
        template = NotificationRepository.get_template_by_code(template_code)
        if not template:
            # Fallback or error logging
            return None
            
        if not NotificationService.check_preference(recipient, template.channel, template.channel):
            return None # User opted out
            
        TemplateService.validate_variables(template, variables)
        rendered = TemplateService.render_template(template, variables)
        
        notif = Notification.objects.create(
            notification_number=NotificationService._generate_notification_number(),
            recipient=recipient,
            sender=sender,
            title=rendered['subject'] or template.name,
            message=rendered['plain_text'] or '',
            html_message=rendered['html'] or '',
            notification_type=NotificationType.SYSTEM, # You can map this dynamically if needed, keeping simple for now
            channel=template.channel,
            priority=NotificationPriority.NORMAL, # You might want to map this based on template
            status=NotificationStatus.PENDING,
            related_object=related_object,
            scheduled_at=scheduled_at
        )
        
        NotificationTimeline.objects.create(
            notification=notif,
            event_type='CREATED',
            description='Notification created.'
        )
        
        if scheduled_at and scheduled_at > timezone.now():
            notif.status = NotificationStatus.QUEUED
            notif.save(update_fields=['status'])
            NotificationTimeline.objects.create(
                notification=notif,
                event_type='QUEUED',
                description=f'Notification queued for {scheduled_at}.'
            )
        else:
            NotificationService.send_notification(notif.id)
            
        return notif

    @staticmethod
    @transaction.atomic
    def send_notification(notification_id):
        notif = Notification.objects.get(id=notification_id)
        
        if notif.channel == NotificationChannel.IN_APP:
            notif.status = NotificationStatus.DELIVERED
            notif.sent_at = timezone.now()
            notif.save(update_fields=['status', 'sent_at'])
            NotificationTimeline.objects.create(
                notification=notif,
                event_type='DELIVERED',
                description='In-App notification delivered immediately.'
            )
            return True
            
        provider = ProviderFactory.get_provider(notif.channel)
        if not provider:
            notif.status = NotificationStatus.FAILED
            notif.failed_at = timezone.now()
            notif.save(update_fields=['status', 'failed_at'])
            NotificationTimeline.objects.create(
                notification=notif,
                event_type='FAILED',
                description=f'No provider found for channel {notif.channel}.'
            )
            return False
            
        payload = {
            'to': notif.recipient.email if notif.channel == NotificationChannel.EMAIL else notif.recipient.phone_number,
            'subject': notif.title,
            'body': notif.html_message or notif.message
        }
        
        try:
            result = provider.send(payload)
            notif.status = NotificationStatus.DELIVERED
            notif.sent_at = timezone.now()
            
            NotificationLog.objects.create(
                notification=notif,
                provider=result['provider'],
                request_payload=payload,
                response_payload=result['response'],
                status='SUCCESS',
                attempts=1
            )
            
            NotificationTimeline.objects.create(
                notification=notif,
                event_type='DELIVERED',
                description=f'Delivered via {result["provider"]}.'
            )
            
        except Exception as e:
            notif.status = NotificationStatus.FAILED
            notif.failed_at = timezone.now()
            
            NotificationLog.objects.create(
                notification=notif,
                provider=provider.__class__.__name__,
                request_payload=payload,
                response_payload={},
                status='FAILED',
                error_message=str(e),
                attempts=1
            )
            
            NotificationTimeline.objects.create(
                notification=notif,
                event_type='FAILED',
                description=f'Delivery failed: {str(e)}'
            )
            
        notif.save()
        return notif.status == NotificationStatus.DELIVERED

    @staticmethod
    def mark_as_read(notification_id, user):
        notif = Notification.objects.filter(id=notification_id, recipient=user).first()
        if notif and notif.status != NotificationStatus.READ:
            notif.status = NotificationStatus.READ
            notif.read_at = timezone.now()
            notif.save(update_fields=['status', 'read_at'])
            NotificationTimeline.objects.create(
                notification=notif,
                event_type='READ',
                description='Notification marked as read.',
                performed_by=user
            )
        return notif

    @staticmethod
    def mark_all_as_read(user):
        Notification.objects.filter(recipient=user, status__in=[NotificationStatus.PENDING, NotificationStatus.DELIVERED]).update(
            status=NotificationStatus.READ,
            read_at=timezone.now()
        )
