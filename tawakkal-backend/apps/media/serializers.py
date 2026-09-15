from rest_framework import serializers
from .models import Media

class MediaListSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = [
            'id', 'url', 'original_filename', 'mime_type', 'size',
            'width', 'height', 'alt_text', 'created_at', 'updated_at', 'variants'
        ]

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_variants(self, obj):
        request = self.context.get('request')
        if not obj.variants:
            return {}
        
        # Prepend MEDIA_URL or absolute URI to the variant paths
        result = {}
        for key, path in obj.variants.items():
            # Since the path is relative to MEDIA_ROOT (like uploads/uuid/file.webp),
            # we can pass it through Django's storage url() or build manually.
            from django.core.files.storage import default_storage
            try:
                url = default_storage.url(path)
                if request:
                    url = request.build_absolute_uri(url)
                result[key] = url
            except Exception:
                result[key] = None
        return result

class MediaDetailSerializer(MediaListSerializer):
    uploaded_by = serializers.StringRelatedField(source='created_by')

    class Meta(MediaListSerializer.Meta):
        fields = MediaListSerializer.Meta.fields + ['uploaded_by']

class MediaUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    alt_text = serializers.CharField(required=False, allow_blank=True, max_length=255)
