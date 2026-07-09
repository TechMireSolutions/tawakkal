from rest_framework import serializers
from apps.catalog.models.badge import Badge
from apps.media.serializers import MediaSerializer

class BadgeSerializer(serializers.ModelSerializer):
    icon_details = MediaSerializer(source='icon', read_only=True)

    class Meta:
        model = Badge
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

    def validate_slug(self, value):
        qs = Badge.objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This slug is already in use.")
        return value
