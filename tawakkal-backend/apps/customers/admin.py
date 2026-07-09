from django.contrib import admin
from .models import *

@admin.register(CustomerTag)
class CustomerTagAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'slug', 'color', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'slug', 'color'])
    list_filter = tuple(['is_deleted'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'user', 'customer_code', 'first_name', 'last_name', 'email', 'created_at', 'is_deleted'])
    search_fields = tuple(['customer_code', 'first_name', 'last_name', 'email'])
    list_filter = tuple(['is_deleted', 'user__id', 'avatar__id', 'accepts_marketing'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'customer', 'address_type', 'is_default', 'first_name', 'last_name', 'created_at', 'is_deleted'])
    search_fields = tuple(['address_type', 'first_name', 'last_name', 'phone'])
    list_filter = tuple(['is_deleted', 'customer__id', 'is_default'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(CustomerNote)
class CustomerNoteAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'customer', 'author', 'text', 'created_at', 'is_deleted'])
    list_filter = tuple(['is_deleted', 'customer__id', 'author__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(CustomerTimeline)
class CustomerTimelineAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'customer', 'event_type', 'description', 'performed_by', 'metadata', 'created_at', 'is_deleted'])
    search_fields = tuple(['event_type'])
    list_filter = tuple(['is_deleted', 'customer__id', 'performed_by__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

