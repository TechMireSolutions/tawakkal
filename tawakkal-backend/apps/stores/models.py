from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.media.models import Media
from apps.catalog.models.product import ProductVariant

class StoreStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'
    COMING_SOON = 'COMING_SOON', 'Coming Soon'
    CLOSED_TEMPORARILY = 'CLOSED_TEMPORARILY', 'Closed Temporarily'
    CLOSED_PERMANENTLY = 'CLOSED_PERMANENTLY', 'Closed Permanently'

class Weekday(models.IntegerChoices):
    MONDAY = 0, 'Monday'
    TUESDAY = 1, 'Tuesday'
    WEDNESDAY = 2, 'Wednesday'
    THURSDAY = 3, 'Thursday'
    FRIDAY = 4, 'Friday'
    SATURDAY = 5, 'Saturday'
    SUNDAY = 6, 'Sunday'

class Store(BaseModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.TextField(blank=True)
    
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_stores'
    )
    
    logo = models.ForeignKey(Media, on_delete=models.SET_NULL, null=True, blank=True, related_name='store_logos')
    cover_image = models.ForeignKey(Media, on_delete=models.SET_NULL, null=True, blank=True, related_name='store_covers')
    
    status = models.CharField(max_length=30, choices=StoreStatus.choices, default=StoreStatus.ACTIVE)
    
    # Configuration
    timezone = models.CharField(max_length=50, default='UTC')
    currency = models.CharField(max_length=3, default='USD')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Address & Geolocation
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class StoreHours(BaseModel):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='hours')
    weekday = models.IntegerField(choices=Weekday.choices)
    is_closed = models.BooleanField(default=False)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)

    class Meta:
        ordering = ['store', 'weekday']
        unique_together = ('store', 'weekday')

    def __str__(self):
        return f"{self.store.name} - {self.get_weekday_display()}"

class Warehouse(BaseModel):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='warehouses')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    address = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=30, choices=StoreStatus.choices, default=StoreStatus.ACTIVE)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.store.name})"

class StoreInventory(BaseModel):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='inventory')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='store_inventory')
    
    stock = models.IntegerField(default=0)
    reserved_stock = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)

    class Meta:
        ordering = ['warehouse', 'variant']
        unique_together = ('warehouse', 'variant')

    @property
    def available_stock(self):
        return max(0, self.stock - self.reserved_stock)

    def __str__(self):
        return f"{self.warehouse.name} - {self.variant.sku}: {self.stock}"

class StoreStaffRole(models.TextChoices):
    MANAGER = 'MANAGER', 'Manager'
    CASHIER = 'CASHIER', 'Cashier'
    INVENTORY_CLERK = 'INVENTORY_CLERK', 'Inventory Clerk'
    SALES_REP = 'SALES_REP', 'Sales Representative'

class StoreStaff(BaseModel):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='staff')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='store_assignments')
    role = models.CharField(max_length=50, choices=StoreStaffRole.choices)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['store', 'user']
        unique_together = ('store', 'user')

    def __str__(self):
        return f"{self.user.email} - {self.store.name} ({self.get_role_display()})"

class StoreTimeline(BaseModel):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='timeline')
    action = models.CharField(max_length=255)
    details = models.JSONField(default=dict, blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.store.name} - {self.action}"
