from django.contrib import admin
from django.utils.html import format_html
from .models import SiteSettings, SystemConfig

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'contact_email', 'updated_at')
    readonly_fields = (
        'created_at', 'updated_at', 'created_by', 'updated_by',
        'main_logo_preview', 'navbar_logo_preview', 'sticky_navbar_logo_preview',
        'preloader_logo_preview', 'footer_logo_preview', 'login_logo_preview',
        'favicon_preview', 'apple_touch_icon_preview', 'social_sharing_image_preview',
        'email_header_logo_preview'
    )
    fieldsets = (
        ('General', {
            'fields': ('site_name', 'site_description')
        }),
        ('Branding', {
            'fields': (
                'primary_color', 'secondary_color',
                'main_logo', 'main_logo_preview',
                'navbar_logo', 'navbar_logo_preview',
                'sticky_navbar_logo', 'sticky_navbar_logo_preview',
                'preloader_logo', 'preloader_logo_preview',
                'footer_logo', 'footer_logo_preview',
                'login_logo', 'login_logo_preview',
                'favicon', 'favicon_preview',
                'apple_touch_icon', 'apple_touch_icon_preview',
                'social_sharing_image', 'social_sharing_image_preview',
                'email_header_logo', 'email_header_logo_preview'
            )
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone', 'address')
        }),
        ('Social Links', {
            'fields': ('facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )

    def _image_preview(self, obj, field_name):
        media = getattr(obj, field_name)
        if not media or not media.file:
            return 'No image uploaded.'
        return format_html(
            '<img src="{}" style="max-height:120px; max-width:320px; object-fit:contain; border:1px solid #ddd; padding:6px; background:#fff" />',
            media.file.url
        )

    def main_logo_preview(self, obj):
        return self._image_preview(obj, 'main_logo')

    def navbar_logo_preview(self, obj):
        return self._image_preview(obj, 'navbar_logo')

    def sticky_navbar_logo_preview(self, obj):
        return self._image_preview(obj, 'sticky_navbar_logo')

    def preloader_logo_preview(self, obj):
        return self._image_preview(obj, 'preloader_logo')

    def footer_logo_preview(self, obj):
        return self._image_preview(obj, 'footer_logo')

    def login_logo_preview(self, obj):
        return self._image_preview(obj, 'login_logo')

    def favicon_preview(self, obj):
        return self._image_preview(obj, 'favicon')

    def apple_touch_icon_preview(self, obj):
        return self._image_preview(obj, 'apple_touch_icon')

    def social_sharing_image_preview(self, obj):
        return self._image_preview(obj, 'social_sharing_image')

    def email_header_logo_preview(self, obj):
        return self._image_preview(obj, 'email_header_logo')

    main_logo_preview.allow_tags = True
    navbar_logo_preview.allow_tags = True
    sticky_navbar_logo_preview.allow_tags = True
    preloader_logo_preview.allow_tags = True
    footer_logo_preview.allow_tags = True
    login_logo_preview.allow_tags = True
    favicon_preview.allow_tags = True
    apple_touch_icon_preview.allow_tags = True
    social_sharing_image_preview.allow_tags = True
    email_header_logo_preview.allow_tags = True

    def has_add_permission(self, request):
        # Enforce singleton
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    list_display = ('maintenance_mode', 'allow_registrations', 'default_language', 'updated_at')
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
    list_filter = ('maintenance_mode', 'allow_registrations')
    fieldsets = (
        ('Platform Status', {
            'fields': ('maintenance_mode', 'allow_registrations', 'require_email_verification')
        }),
        ('Localization', {
            'fields': ('default_language', 'default_currency')
        }),
        ('Security & Limits', {
            'fields': ('max_upload_size_mb', 'session_timeout_minutes', 'enable_audit_logging')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )

    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

