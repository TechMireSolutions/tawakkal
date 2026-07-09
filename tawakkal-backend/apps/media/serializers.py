from rest_framework import serializers
from .models import Media

class MediaListSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = [
            'id', 'url', 'original_filename', 'mime_type', 'size',
            'width', 'height', 'alt_text', 'created_at', 'updated_at'
        ]

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

class MediaDetailSerializer(MediaListSerializer):
    uploaded_by = serializers.StringRelatedField(source='created_by')

    class Meta(MediaListSerializer.Meta):
        fields = MediaListSerializer.Meta.fields + ['uploaded_by']

class MediaUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    alt_text = serializers.CharField(required=False, allow_blank=True, max_length=255)
