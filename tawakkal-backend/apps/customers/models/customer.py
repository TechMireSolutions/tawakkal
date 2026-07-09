from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .tag import CustomerTag

class CustomerStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'
    BLOCKED = 'BLOCKED', 'Blocked'

class CustomerTier(models.TextChoices):
    BRONZE = 'BRONZE', 'Bronze'
    SILVER = 'SILVER', 'Silver'
    GOLD = 'GOLD', 'Gold'
    PLATINUM = 'PLATINUM', 'Platinum'
    VIP = 'VIP', 'VIP'

class Gender(models.TextChoices):
    MALE = 'MALE', 'Male'
    FEMALE = 'FEMALE', 'Female'
    OTHER = 'OTHER', 'Other'
    PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY', 'Prefer not to say'

class Customer(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='customer_profile'
    )
    customer_code = models.CharField(max_length=50, unique=True, db_index=True)
    
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=50, blank=True, db_index=True)
    alternate_phone = models.CharField(max_length=50, blank=True)
    
    avatar = models.ForeignKey(
        'media.Media', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='customer_avatars'
    )
    
    gender = models.CharField(max_length=20, choices=Gender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    company_name = models.CharField(max_length=255, blank=True)
    tax_number = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(max_length=20, choices=CustomerStatus.choices, default=CustomerStatus.ACTIVE, db_index=True)
    tier = models.CharField(max_length=20, choices=CustomerTier.choices, default=CustomerTier.BRONZE, db_index=True)
    
    notes = models.TextField(blank=True, help_text="Internal notes")
    preferred_language = models.CharField(max_length=10, default='en')
    preferred_currency = models.CharField(max_length=3, default='USD')
    
    accepts_marketing = models.BooleanField(default=False)
    accepts_sms = models.BooleanField(default=False)
    
    loyalty_points = models.IntegerField(default=0)
    
    tags = models.ManyToManyField(CustomerTag, blank=True, related_name='customers')

    # Statistics
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    average_order_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    last_order_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.customer_code} - {self.full_name}"
