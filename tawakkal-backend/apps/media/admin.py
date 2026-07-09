from django.contrib import admin
from .models import *

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'file', 'original_filename', 'mime_type', 'size', 'width', 'created_at', 'is_deleted'])
    search_fields = tuple(['original_filename', 'mime_type', 'alt_text'])
    list_filter = tuple(['is_deleted'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

