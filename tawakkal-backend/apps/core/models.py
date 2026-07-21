import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings

class SafeDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

    def deleted(self):
        return super().get_queryset().filter(is_deleted=True)

    def all_with_deleted(self):
        return super().get_queryset()

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # We will set created_by and updated_by using settings.AUTH_USER_MODEL
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SafeDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()

class SingletonModel(BaseModel):
    """Singleton model for global configurations."""
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class SiteSettings(SingletonModel):
    site_name = models.CharField(max_length=100, default='Tawakkal Luxury')
    site_description = models.TextField(blank=True)
    primary_color = models.CharField(max_length=20, default='#1c1c1c')
    secondary_color = models.CharField(max_length=20, default='#cda434')
    
    # Media Library Integration for Branding
    main_logo = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_main_logo')
    navbar_logo = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_navbar_logo')
    sticky_navbar_logo = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_sticky_logo')
    preloader_logo = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_preloader_logo')
    footer_logo = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_footer_logo')
    login_logo = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_login_logo')
    favicon = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_favicon')
    apple_touch_icon = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_apple_icon')
    social_sharing_image = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_social_image')
    email_header_logo = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='site_email_logo')
    contact_email = models.EmailField(default='support@tawakkal.com')
    contact_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    tiktok_profile_url = models.URLField(blank=True)
    tiktok_embed_code = models.TextField(blank=True)

    # ---------------------------------------------------------
    # Hero Section CMS
    # ---------------------------------------------------------
    BUTTON_STYLE_CHOICES = [
        ("primary", "Primary"),
        ("secondary", "Secondary"),
        ("outline", "Outline"),
        ("ghost", "Ghost"),
    ]

    hero_enabled = models.BooleanField(default=True)
    hero_background_enabled = models.BooleanField(default=True)
    hero_left_image_enabled = models.BooleanField(default=True)
    hero_right_image_enabled = models.BooleanField(default=True)

    hero_overlay_opacity = models.FloatField(default=0.35)
    hero_height = models.CharField(max_length=20, default="100vh")
    hero_mobile_height = models.CharField(max_length=20, default="70vh")

    hero_background = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='hero_bg')
    hero_left_image = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='hero_left')
    hero_right_image = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='hero_right')
    
    hero_video = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='hero_vid')
    hero_mobile_background = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='hero_mobile_bg')
    hero_mobile_left_image = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='hero_mobile_left')
    hero_mobile_right_image = models.ForeignKey('media.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='hero_mobile_right')

    hero_small_text = models.TextField(blank=True, default="")
    hero_subtitle = models.TextField(blank=True, default="")
    hero_title = models.TextField(blank=True, default="")
    hero_highlight_title = models.TextField(blank=True, default="")

    hero_left_button_text = models.CharField(max_length=100, blank=True)
    hero_left_button_link = models.CharField(max_length=255, blank=True)
    hero_left_button_style = models.CharField(max_length=20, choices=BUTTON_STYLE_CHOICES, default="primary")

    hero_center_button_text = models.CharField(max_length=100, blank=True)
    hero_center_button_link = models.CharField(max_length=255, blank=True)
    hero_center_button_style = models.CharField(max_length=20, choices=BUTTON_STYLE_CHOICES, default="primary")

    hero_right_button_text = models.CharField(max_length=100, blank=True)
    hero_right_button_link = models.CharField(max_length=255, blank=True)
    hero_right_button_style = models.CharField(max_length=20, choices=BUTTON_STYLE_CHOICES, default="primary")

    class Meta:
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return "Site Settings"

class SystemConfig(SingletonModel):
    maintenance_mode = models.BooleanField(default=False)
    allow_registrations = models.BooleanField(default=True)
    require_email_verification = models.BooleanField(default=False)
    default_language = models.CharField(max_length=10, default='en')
    default_currency = models.CharField(max_length=10, default='USD')
    max_upload_size_mb = models.IntegerField(default=5)
    session_timeout_minutes = models.IntegerField(default=60)
    enable_audit_logging = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'System Configuration'
        verbose_name_plural = 'System Configurations'

    def __str__(self):
        return "System Configuration"
