from django.contrib import admin
from .models import *

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'name', 'slug', 'provider', 'is_active', 'supports_refund', 'created_at', 'is_deleted'])
    search_fields = tuple(['name', 'slug', 'provider'])
    list_filter = tuple(['is_deleted', 'is_active', 'supports_refund', 'supports_partial'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'invoice_number', 'order', 'issue_date', 'due_date', 'currency', 'created_at', 'is_deleted'])
    search_fields = tuple(['invoice_number', 'currency', 'status'])
    list_filter = tuple(['is_deleted', 'order__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'invoice', 'product_name', 'sku', 'quantity', 'unit_price', 'created_at', 'is_deleted'])
    search_fields = tuple(['product_name', 'sku'])
    list_filter = tuple(['is_deleted', 'invoice__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'payment_number', 'order', 'payment_method', 'currency', 'amount', 'created_at', 'is_deleted'])
    search_fields = tuple(['payment_number', 'currency', 'transaction_id', 'status'])
    list_filter = tuple(['is_deleted', 'order__id', 'payment_method__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(PaymentAllocation)
class PaymentAllocationAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'payment', 'invoice', 'amount_allocated', 'created_at', 'is_deleted'])
    list_filter = tuple(['is_deleted', 'payment__id', 'invoice__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'payment', 'amount', 'reason', 'status', 'created_at', 'is_deleted'])
    search_fields = tuple(['status'])
    list_filter = tuple(['is_deleted', 'payment__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(CreditNote)
class CreditNoteAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'credit_note_number', 'refund', 'invoice', 'amount', 'issue_date', 'created_at', 'is_deleted'])
    search_fields = tuple(['credit_note_number'])
    list_filter = tuple(['is_deleted', 'refund__id', 'invoice__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(PaymentTimeline)
class PaymentTimelineAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'payment', 'invoice', 'event_type', 'description', 'performed_by', 'created_at', 'is_deleted'])
    search_fields = tuple(['event_type'])
    list_filter = tuple(['is_deleted', 'payment__id', 'invoice__id', 'performed_by__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

