from django.contrib import admin
from .models import *

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'order_number', 'customer', 'store', 'shipping_address', 'billing_address', 'created_at', 'is_deleted'])
    search_fields = tuple(['order_number', 'status', 'currency', 'payment_status'])
    list_filter = tuple(['is_deleted', 'customer__id', 'store__id', 'shipping_address__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'order', 'variant', 'product_name', 'sku', 'barcode', 'created_at', 'is_deleted'])
    search_fields = tuple(['product_name', 'sku', 'barcode', 'color'])
    list_filter = tuple(['is_deleted', 'order__id', 'variant__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(OrderTimeline)
class OrderTimelineAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'order', 'event_type', 'description', 'performed_by', 'created_at', 'is_deleted'])
    search_fields = tuple(['event_type'])
    list_filter = tuple(['is_deleted', 'order__id', 'performed_by__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(OrderNote)
class OrderNoteAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'order', 'author', 'text', 'created_at', 'is_deleted'])
    list_filter = tuple(['is_deleted', 'order__id', 'author__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

