from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('last_login', 'is_superuser', 'username', 'first_name', 'last_name')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')
    list_filter = ('last_login', 'is_superuser', 'is_staff')
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

