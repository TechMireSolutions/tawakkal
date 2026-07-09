from rest_framework import serializers
from ..models.category import Category

class CategoryListSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    children_count = serializers.IntegerField(read_only=True, default=0)
    # product_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'path', 'level', 'status', 'display_order',
            'is_featured', 'image_url', 'children_count', 'created_at', 'updated_at'
            # 'product_count'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and obj.image.file:
            if request:
                return request.build_absolute_uri(obj.image.file.url)
            return obj.image.file.url
        return None

class CategoryDetailSerializer(CategoryListSerializer):
    parent_id = serializers.PrimaryKeyRelatedField(source='parent', read_only=True)
    
    class Meta(CategoryListSerializer.Meta):
        fields = CategoryListSerializer.Meta.fields + [
            'description', 'seo_title', 'seo_description', 'seo_keywords', 'parent_id'
        ]

class CategoryTreeSerializer(CategoryListSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta(CategoryListSerializer.Meta):
        fields = CategoryListSerializer.Meta.fields + ['children']
        
    def get_children(self, obj):
        if hasattr(obj, 'children_prefetched'):
            # Optimization: If we prefetch children and attach them to the object
            children = obj.children_prefetched
        else:
            children = obj.children.filter(is_deleted=False)
        return CategoryTreeSerializer(children, many=True, context=self.context).data

class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    # Allow passing slug but it's optional due to auto-generation
    slug = serializers.SlugField(required=False, allow_blank=True, max_length=255)
    
    class Meta:
        model = Category
        fields = [
            'name', 'slug', 'description', 'parent', 'image', 'status',
            'display_order', 'seo_title', 'seo_description', 'seo_keywords', 'is_featured'
        ]
