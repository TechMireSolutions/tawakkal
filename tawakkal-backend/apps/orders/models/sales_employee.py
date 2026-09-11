from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from apps.core.models import BaseModel
import re

class SalesEmployee(BaseModel):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    coupon_code = models.CharField(max_length=50, unique=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            UniqueConstraint(
                Lower('first_name'),
                Lower('last_name'),
                name='unique_sales_employee_name_ci'
            )
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.coupon_code})"

    def clean(self):
        super().clean()
        
        # Ensure case-insensitive uniqueness check in Python just in case
        if self.first_name and self.last_name:
            fn_clean = self.first_name.strip().lower()
            ln_clean = self.last_name.strip().lower()
            
            qs = SalesEmployee.objects.annotate(
                fn_lower=Lower('first_name'),
                ln_lower=Lower('last_name')
            ).filter(
                fn_lower=fn_clean,
                ln_lower=ln_clean
            )
            
            if self.pk:
                qs = qs.exclude(pk=self.pk)
                
            if qs.exists():
                raise ValidationError("A sales employee with this exact first name and last name already exists.")

    def _generate_coupon_code(self):
        """Generate a short, human-readable coupon code like FIRST-LAST, with numeric suffix if needed."""
        # Sanitize to alphanumeric
        first = re.sub(r'[^a-zA-Z0-9]', '', self.first_name).upper()
        last = re.sub(r'[^a-zA-Z0-9]', '', self.last_name).upper()
        base_code = f"{first}-{last}"
        
        if not base_code or base_code == "-":
            base_code = "EMP-000"
            
        code = base_code
        counter = 1
        
        while True:
            # Case insensitive check
            qs = SalesEmployee.objects.filter(coupon_code__iexact=code)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            
            if not qs.exists():
                return code
            code = f"{base_code}-{counter}"
            counter += 1

    def save(self, *args, **kwargs):
        self.first_name = self.first_name.strip()
        self.last_name = self.last_name.strip()
        
        if not self.coupon_code:
            self.coupon_code = self._generate_coupon_code()
        else:
            self.coupon_code = self.coupon_code.strip().upper()
            
        # Call clean to enforce uniqueness during save
        self.clean()
        
        super().save(*args, **kwargs)
