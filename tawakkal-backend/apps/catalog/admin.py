from django.contrib import admin
from .models import *

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'slug', 'description', 'parent', 'image', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'slug', 'seo_title', 'seo_keywords'])
    list_filter = tuple(['is_deleted', 'parent__id', 'image__id', 'status'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ProductColor)
class ProductColorAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'code', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'code'])
    list_filter = tuple(['is_deleted'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ProductSize)
class ProductSizeAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'code', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'code'])
    list_filter = tuple(['is_deleted'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'slug', 'description', 'category', 'brand', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'slug', 'brand', 'status'])
    list_filter = tuple(['is_deleted', 'category__id', 'is_featured'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'product', 'sku', 'color', 'size', 'status', 'created_at', 'is_deleted'])
    search_fields = tuple(['sku', 'status'])
    list_filter = tuple(['is_deleted', 'product__id', 'color__id', 'size__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'product', 'variant', 'media', 'display_order', 'is_primary', 'created_at', 'is_deleted'])
    list_filter = tuple(['is_deleted', 'product__id', 'variant__id', 'media__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'variant', 'change', 'before_quantity', 'after_quantity', 'reason', 'created_at', 'is_deleted'])
    search_fields = tuple(['reason', 'reference_type', 'reference_id'])
    list_filter = tuple(['is_deleted', 'variant__id', 'performed_by__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

