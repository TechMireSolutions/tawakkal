from rest_framework import serializers
from apps.catalog.models.brand import Brand
from apps.media.serializers import MediaListSerializer

class BrandSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True, max_length=255)
    logo_details = MediaListSerializer(source='logo', read_only=True)
    cover_image_details = MediaListSerializer(source='cover_image', read_only=True)

    class Meta:
        model = Brand
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

    def validate_slug(self, value):
        if not value:
            return value
        qs = Brand.all_objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This slug is already in use.")
        return value
