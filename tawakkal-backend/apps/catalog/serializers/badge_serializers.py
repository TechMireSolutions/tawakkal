from rest_framework import serializers
from apps.catalog.models.badge import Badge
from apps.media.serializers import MediaListSerializer

class BadgeSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True, max_length=255)
    icon_details = MediaListSerializer(source='icon', read_only=True)

    class Meta:
        model = Badge
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

    def validate_slug(self, value):
        if not value:
            return value
        qs = Badge.all_objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This slug is already in use.")
        return value
