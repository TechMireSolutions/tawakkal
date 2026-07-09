from rest_framework import serializers
from ..models.product import (
    Product, ProductVariant, ProductImage, 
    ProductColor, ProductSize
)
from .category_serializers import CategoryListSerializer

class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'name', 'code']

class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['id', 'name', 'code']

class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'media', 'variant', 'display_order', 'is_primary', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.media and obj.media.file:
            if request:
                return request.build_absolute_uri(obj.media.file.url)
            return obj.media.file.url
        return None

class ProductVariantSerializer(serializers.ModelSerializer):
    color = ProductColorSerializer(read_only=True)
    size = ProductSizeSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    available_stock = serializers.IntegerField(read_only=True)
    price = serializers.DecimalField(source='get_price', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'color', 'size', 'status', 'price_override', 'price',
            'stock', 'reserved_stock', 'available_stock', 'weight', 'images'
        ]

class ProductListSerializer(serializers.ModelSerializer):
    category = CategoryListSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    price_range = serializers.SerializerMethodField()
    brand = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'brand', 'badges', 'status', 
            'is_featured', 'base_price', 'compare_at_price', 'stock', 'primary_image', 'price_range', 'created_at', 'discount_percentage'
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True, is_deleted=False).first()
        if not img:
            img = obj.images.filter(is_deleted=False).first()
        if img:
            return ProductImageSerializer(img, context=self.context).data
        return None

    def get_price_range(self, obj):
        variants = obj.variants.filter(is_deleted=False)
        prices = [v.get_price() for v in variants]
        if not prices:
            prices = [obj.base_price]
        return {
            'min': min(prices),
            'max': max(prices)
        }

    def get_brand(self, obj):
        if obj.brand:
            from .brand_serializers import BrandSerializer
            return BrandSerializer(obj.brand, context=self.context).data
        return None

    def get_badges(self, obj):
        # We assume the user wants custom badges to be serialized here.
        # Priority sort is done at DB level since Meta has ordering.
        from .badge_serializers import BadgeSerializer
        return BadgeSerializer(obj.badges.all(), many=True, context=self.context).data
        
    def get_discount_percentage(self, obj):
        if obj.compare_at_price and obj.compare_at_price > obj.base_price:
            return round(((obj.compare_at_price - obj.base_price) / obj.compare_at_price) * 100)
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategoryListSerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    price_range = serializers.SerializerMethodField()
    brand = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'brand', 'badges', 'status', 
            'is_featured', 'base_price', 'compare_at_price', 'stock', 'low_stock_threshold',
            'seo_title', 'seo_description', 'seo_keywords',
            'created_at', 'updated_at', 'variants', 'images', 'price_range', 'discount_percentage'
        ]

    def get_price_range(self, obj):
        variants = obj.variants.filter(is_deleted=False)
        prices = [v.get_price() for v in variants]
        if not prices:
            prices = [obj.base_price]
        return {
            'min': min(prices),
            'max': max(prices)
        }

    def get_brand(self, obj):
        if obj.brand:
            from .brand_serializers import BrandSerializer
            return BrandSerializer(obj.brand, context=self.context).data
        return None

    def get_badges(self, obj):
        from .badge_serializers import BadgeSerializer
        return BadgeSerializer(obj.badges.all(), many=True, context=self.context).data

    def get_discount_percentage(self, obj):
        if obj.compare_at_price and obj.compare_at_price > obj.base_price:
            return round(((obj.compare_at_price - obj.base_price) / obj.compare_at_price) * 100)
        return None

class VariantWriteSerializer(serializers.Serializer):
    sku = serializers.CharField(required=False, allow_blank=True)
    color_id = serializers.UUIDField(required=False, allow_null=True)
    size_id = serializers.UUIDField(required=False, allow_null=True)
    price_override = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True, min_value=0)
    stock = serializers.IntegerField(default=0, min_value=0)
    weight = serializers.DecimalField(max_digits=8, decimal_places=2, required=False, allow_null=True, min_value=0)

class ProductCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    slug = serializers.SlugField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    category_id = serializers.UUIDField()
    brand_id = serializers.UUIDField(required=False, allow_null=True)
    badge_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    base_price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    compare_at_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True, min_value=0)
    stock = serializers.IntegerField(default=0, min_value=0)
    low_stock_threshold = serializers.IntegerField(default=5, min_value=0)
    status = serializers.ChoiceField(choices=['ACTIVE', 'DRAFT', 'ARCHIVED'], required=False, default='DRAFT')
    is_featured = serializers.BooleanField(default=False)
    
    seo_title = serializers.CharField(max_length=255, required=False, allow_blank=True)
    seo_description = serializers.CharField(required=False, allow_blank=True)
    seo_keywords = serializers.CharField(max_length=255, required=False, allow_blank=True)
    media_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    
    variants = VariantWriteSerializer(many=True, required=False)

    def validate(self, data):
        if data.get('compare_at_price') is not None and data.get('base_price') is not None:
            if data['compare_at_price'] < data['base_price']:
                raise serializers.ValidationError({"compare_at_price": "Compare price cannot be less than base price."})
        return data

class ProductUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    slug = serializers.SlugField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    category_id = serializers.UUIDField(required=False)
    brand_id = serializers.UUIDField(required=False, allow_null=True)
    badge_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    base_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=0)
    compare_at_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True, min_value=0)
    stock = serializers.IntegerField(required=False, min_value=0)
    low_stock_threshold = serializers.IntegerField(required=False, min_value=0)
    status = serializers.ChoiceField(choices=['ACTIVE', 'DRAFT', 'ARCHIVED'], required=False)
    is_featured = serializers.BooleanField(required=False)
    
    seo_title = serializers.CharField(max_length=255, required=False, allow_blank=True)
    seo_description = serializers.CharField(required=False, allow_blank=True)
    seo_keywords = serializers.CharField(max_length=255, required=False, allow_blank=True)
    media_ids = serializers.ListField(child=serializers.UUIDField(), required=False)

    def validate(self, data):
        if data.get('compare_at_price') is not None and data.get('base_price') is not None:
            if data['compare_at_price'] < data['base_price']:
                raise serializers.ValidationError({"compare_at_price": "Compare price cannot be less than base price."})
        return data
