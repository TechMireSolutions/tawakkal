from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel

class NotificationType(models.TextChoices):
    ORDER = 'ORDER', _('Order')
    PAYMENT = 'PAYMENT', _('Payment')
    SHIPPING = 'SHIPPING', _('Shipping')
    REFUND = 'REFUND', _('Refund')
    SURVEY = 'SURVEY', _('Survey')
    SYSTEM = 'SYSTEM', _('System')
    SECURITY = 'SECURITY', _('Security')
    MARKETING = 'MARKETING', _('Marketing')

class NotificationChannel(models.TextChoices):
    IN_APP = 'IN_APP', _('In-App')
    EMAIL = 'EMAIL', _('Email')
    SMS = 'SMS', _('SMS')
    PUSH = 'PUSH', _('Push Notification')

class NotificationPriority(models.TextChoices):
    LOW = 'LOW', _('Low')
    NORMAL = 'NORMAL', _('Normal')
    HIGH = 'HIGH', _('High')
    CRITICAL = 'CRITICAL', _('Critical')

class NotificationStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    QUEUED = 'QUEUED', _('Queued')
    SENT = 'SENT', _('Sent')
    DELIVERED = 'DELIVERED', _('Delivered')
    FAILED = 'FAILED', _('Failed')
    READ = 'READ', _('Read')

class Notification(BaseModel):
    notification_number = models.CharField(max_length=50, unique=True)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    html_message = models.TextField(null=True, blank=True)
    
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    channel = models.CharField(max_length=50, choices=NotificationChannel.choices, default=NotificationChannel.IN_APP)
    priority = models.CharField(max_length=20, choices=NotificationPriority.choices, default=NotificationPriority.NORMAL)
    status = models.CharField(max_length=20, choices=NotificationStatus.choices, default=NotificationStatus.PENDING)
    
    related_object_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.CASCADE)
    related_object_id = models.CharField(max_length=255, null=True, blank=True)
    related_object = GenericForeignKey('related_object_type', 'related_object_id')
    
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_number} - {self.recipient.email}"

class NotificationTemplate(BaseModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=255, null=True, blank=True)
    html = models.TextField(null=True, blank=True)
    plain_text = models.TextField(null=True, blank=True)
    variables = models.JSONField(default=list, blank=True, help_text="List of available variables (e.g., ['customer_name', 'order_number'])")
    channel = models.CharField(max_length=50, choices=NotificationChannel.choices, default=NotificationChannel.EMAIL)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.channel})"

class NotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences', primary_key=True)
    
    # Global channels
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=False)
    in_app_enabled = models.BooleanField(default=True)
    
    # Categories
    marketing_enabled = models.BooleanField(default=False)
    order_updates = models.BooleanField(default=True)
    shipping_updates = models.BooleanField(default=True)
    payment_updates = models.BooleanField(default=True)
    refund_updates = models.BooleanField(default=True)
    survey_updates = models.BooleanField(default=False)
    announcements_enabled = models.BooleanField(default=True)
    security_updates = models.BooleanField(default=True) # Usually mandatory, but preference exists

    def __str__(self):
        return f"Preferences for {self.user.email}"

class AnnouncementAudience(models.TextChoices):
    ALL = 'ALL', _('All Users')
    CUSTOMERS = 'CUSTOMERS', _('Customers Only')
    STAFF = 'STAFF', _('Staff Only')
    ADMINS = 'ADMINS', _('Admins Only')

class Announcement(BaseModel):
    title = models.CharField(max_length=255)
    message = models.TextField()
    audience = models.CharField(max_length=50, choices=AnnouncementAudience.choices, default=AnnouncementAudience.ALL)
    priority = models.CharField(max_length=20, choices=NotificationPriority.choices, default=NotificationPriority.NORMAL)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)
    dismissible = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class NotificationLog(BaseModel):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    provider = models.CharField(max_length=100)
    request_payload = models.JSONField(default=dict, blank=True)
    response_payload = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=50)
    error_message = models.TextField(null=True, blank=True)
    attempts = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"Log for {self.notification.notification_number}"

class NotificationTimeline(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='timeline')
    event_type = models.CharField(max_length=100)
    description = models.TextField()
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.event_type} on {self.notification.notification_number}"
