from rest_framework import serializers
from .models import SiteSettings, SystemConfig


BRANDING_MEDIA_FIELDS = [
    'main_logo', 'navbar_logo', 'sticky_navbar_logo', 'preloader_logo',
    'footer_logo', 'login_logo', 'favicon', 'apple_touch_icon',
    'social_sharing_image', 'email_header_logo'
]

HERO_MEDIA_FIELDS = [
    'hero_background', 'hero_left_image', 'hero_right_image',
    'hero_video', 'hero_mobile_background', 'hero_mobile_left_image', 'hero_mobile_right_image'
]


class SiteSettingsSerializer(serializers.ModelSerializer):
    main_logo_url = serializers.SerializerMethodField()
    navbar_logo_url = serializers.SerializerMethodField()
    sticky_navbar_logo_url = serializers.SerializerMethodField()
    preloader_logo_url = serializers.SerializerMethodField()
    footer_logo_url = serializers.SerializerMethodField()
    login_logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()
    apple_touch_icon_url = serializers.SerializerMethodField()
    social_sharing_image_url = serializers.SerializerMethodField()
    email_header_logo_url = serializers.SerializerMethodField()

    hero_background_url = serializers.SerializerMethodField()
    hero_left_image_url = serializers.SerializerMethodField()
    hero_right_image_url = serializers.SerializerMethodField()
    hero_video_url = serializers.SerializerMethodField()
    hero_mobile_background_url = serializers.SerializerMethodField()
    hero_mobile_left_image_url = serializers.SerializerMethodField()
    hero_mobile_right_image_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        exclude = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'deleted_at')
        read_only_fields = tuple(f'{field}_url' for field in BRANDING_MEDIA_FIELDS + HERO_MEDIA_FIELDS)

    def get_media_url(self, obj, field):
        media = getattr(obj, field, None)
        if not media or not media.file:
            return None
        request = self.context.get('request')
        url = media.file.url
        return request.build_absolute_uri(url) if request else url

    def get_main_logo_url(self, obj):
        return self.get_media_url(obj, 'main_logo')

    def get_navbar_logo_url(self, obj):
        return self.get_media_url(obj, 'navbar_logo')

    def get_sticky_navbar_logo_url(self, obj):
        return self.get_media_url(obj, 'sticky_navbar_logo')

    def get_preloader_logo_url(self, obj):
        return self.get_media_url(obj, 'preloader_logo')

    def get_footer_logo_url(self, obj):
        return self.get_media_url(obj, 'footer_logo')

    def get_login_logo_url(self, obj):
        return self.get_media_url(obj, 'login_logo')

    def get_favicon_url(self, obj):
        return self.get_media_url(obj, 'favicon')

    def get_apple_touch_icon_url(self, obj):
        return self.get_media_url(obj, 'apple_touch_icon')

    def get_social_sharing_image_url(self, obj):
        return self.get_media_url(obj, 'social_sharing_image')

    def get_email_header_logo_url(self, obj):
        return self.get_media_url(obj, 'email_header_logo')

    def get_hero_background_url(self, obj):
        return self.get_media_url(obj, 'hero_background')

    def get_hero_left_image_url(self, obj):
        return self.get_media_url(obj, 'hero_left_image')

    def get_hero_right_image_url(self, obj):
        return self.get_media_url(obj, 'hero_right_image')

    def get_hero_video_url(self, obj):
        return self.get_media_url(obj, 'hero_video')

    def get_hero_mobile_background_url(self, obj):
        return self.get_media_url(obj, 'hero_mobile_background')

    def get_hero_mobile_left_image_url(self, obj):
        return self.get_media_url(obj, 'hero_mobile_left_image')

    def get_hero_mobile_right_image_url(self, obj):
        return self.get_media_url(obj, 'hero_mobile_right_image')


class SystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        exclude = ('created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'deleted_at')