from django.contrib import admin
from .models import *

@admin.register(ShippingCarrier)
class ShippingCarrierAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'code', 'is_active', 'tracking_url_template', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'code', 'tracking_url_template'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'carrier', 'name', 'code', 'estimated_days', 'is_active', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'code'])
    list_filter = tuple(['is_deleted', 'carrier__id', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'shipment_number', 'order', 'warehouse', 'carrier', 'shipping_method', 'created_at', 'is_deleted'])
    search_fields = tuple(['shipment_number', 'tracking_number', 'label_url', 'status'])
    list_filter = tuple(['is_deleted', 'order__id', 'warehouse__id', 'carrier__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ShipmentItem)
class ShipmentItemAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'shipment', 'order_item', 'sku', 'product_name', 'variant_id', 'created_at', 'is_deleted'])
    search_fields = tuple(['sku', 'product_name'])
    list_filter = tuple(['is_deleted', 'shipment__id', 'order_item__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ShipmentTimeline)
class ShipmentTimelineAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'shipment', 'event_type', 'description', 'performed_by', 'created_at', 'is_deleted'])
    search_fields = tuple(['event_type'])
    list_filter = tuple(['is_deleted', 'shipment__id', 'performed_by__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ReturnReason)
class ReturnReasonAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'code', 'description', 'is_active', 'created_at', 'is_deleted'])
    search_fields = tuple(['code', 'description'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'return_number', 'order', 'status', 'notes', 'created_at', 'is_deleted'])
    search_fields = tuple(['return_number', 'status'])
    list_filter = tuple(['is_deleted', 'order__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ReturnItem)
class ReturnItemAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'return_request', 'shipment_item', 'reason', 'quantity', 'sku', 'created_at', 'is_deleted'])
    search_fields = tuple(['sku', 'product_name'])
    list_filter = tuple(['is_deleted', 'return_request__id', 'shipment_item__id', 'reason__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ReturnTimeline)
class ReturnTimelineAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'return_request', 'event_type', 'description', 'performed_by', 'created_at', 'is_deleted'])
    search_fields = tuple(['event_type'])
    list_filter = tuple(['is_deleted', 'return_request__id', 'performed_by__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

