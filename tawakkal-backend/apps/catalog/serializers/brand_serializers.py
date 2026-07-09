from rest_framework import serializers
from apps.catalog.models.brand import Brand
from apps.media.serializers import MediaSerializer

class BrandSerializer(serializers.ModelSerializer):
    logo_details = MediaSerializer(source='logo', read_only=True)
    cover_image_details = MediaSerializer(source='cover_image', read_only=True)

    class Meta:
        model = Brand
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

    def validate_slug(self, value):
        qs = Brand.objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This slug is already in use.")
        return value
