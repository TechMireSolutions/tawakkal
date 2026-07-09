from django.contrib import admin
from .models import *

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'code', 'slug', 'description', 'email', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'code', 'slug', 'email'])
    list_filter = tuple(['is_deleted', 'manager__id', 'logo__id', 'cover_image__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(StoreHours)
class StoreHoursAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'store', 'weekday', 'is_closed', 'opening_time', 'closing_time', 'created_at', 'is_deleted'])
    list_filter = tuple(['is_deleted', 'store__id', 'is_closed'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'store', 'name', 'code', 'address', 'status', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'code', 'address', 'status'])
    list_filter = tuple(['is_deleted', 'store__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(StoreInventory)
class StoreInventoryAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'warehouse', 'variant', 'stock', 'reserved_stock', 'reorder_level', 'created_at', 'is_deleted'])
    list_filter = tuple(['is_deleted', 'warehouse__id', 'variant__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(StoreStaff)
class StoreStaffAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'store', 'user', 'role', 'is_active', 'created_at', 'is_deleted'])
    search_fields = tuple(['role'])
    list_filter = tuple(['is_deleted', 'store__id', 'user__id', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(StoreTimeline)
class StoreTimelineAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'store', 'action', 'details', 'performed_by', 'created_at', 'is_deleted'])
    search_fields = tuple(['action'])
    list_filter = tuple(['is_deleted', 'store__id', 'performed_by__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

