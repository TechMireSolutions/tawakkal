from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .category import Category

class ProductStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    ACTIVE = 'ACTIVE', 'Active'
    OUT_OF_STOCK = 'OUT_OF_STOCK', 'Out of Stock'
    ARCHIVED = 'ARCHIVED', 'Archived'

class VariantStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    DISCONTINUED = 'DISCONTINUED', 'Discontinued'
    COMING_SOON = 'COMING_SOON', 'Coming Soon'

class InventoryReason(models.TextChoices):
    ORDER = 'ORDER', 'Order'
    RESTOCK = 'RESTOCK', 'Restock'
    RETURN = 'RETURN', 'Return'
    MANUAL = 'MANUAL', 'Manual Adjustment'
    IMPORT = 'IMPORT', 'Import'
    ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'
    DAMAGE = 'DAMAGE', 'Damage'

class ProductColor(BaseModel):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=20, help_text="Hex code or abbreviation")

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class ProductSize(BaseModel):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=20, help_text="Short code (e.g. S, M, L, XL)")

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Product(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.TextField(blank=True)
    
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    brand = models.ForeignKey('catalog.Brand', on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    badges = models.ManyToManyField('catalog.Badge', blank=True, related_name='products')
    status = models.CharField(max_length=20, choices=ProductStatus.choices, default=ProductStatus.DRAFT)
    is_featured = models.BooleanField(default=False)
    
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=5)
    
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class ProductVariant(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    
    color = models.ForeignKey(ProductColor, on_delete=models.PROTECT, null=True, blank=True, related_name='variants')
    size = models.ForeignKey(ProductSize, on_delete=models.PROTECT, null=True, blank=True, related_name='variants')
    
    status = models.CharField(max_length=20, choices=VariantStatus.choices, default=VariantStatus.ACTIVE, db_index=True)
    
    price_override = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Overrides base price if set")
    
    stock = models.IntegerField(default=0)
    reserved_stock = models.IntegerField(default=0)
    
    weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Weight in kg")

    class Meta:
        ordering = ['product', 'id']

    @property
    def available_stock(self):
        return max(0, self.stock - self.reserved_stock)

    def get_price(self):
        return self.price_override if self.price_override is not None else self.product.base_price

    def __str__(self):
        return f"{self.product.name} - {self.sku}"

class ProductImage(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True, related_name='images')
    
    media = models.ForeignKey('media.Media', on_delete=models.PROTECT, related_name='product_images')
    
    display_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Image {self.id} for {self.product.name}"

class InventoryLog(BaseModel):
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='inventory_logs')
    change = models.IntegerField()
    before_quantity = models.IntegerField()
    after_quantity = models.IntegerField()
    
    reason = models.CharField(max_length=20, choices=InventoryReason.choices)
    
    reference_type = models.CharField(max_length=100, blank=True)
    reference_id = models.CharField(max_length=100, blank=True)
    
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='performed_inventory_logs')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.variant.sku} | {self.change} | {self.reason}"
