from django.db import models
from django.core.exceptions import ValidationError
from apps.core.models import BaseModel

class Category(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    brand = models.ForeignKey(
        'catalog.Brand',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='categories'
    )
    parent = models.ForeignKey(
        'self', 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True, 
        related_name='children'
    )
    image = models.ForeignKey(
        'media.Media', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='categories'
    )
    status = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    
    # SEO Fields
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=255, blank=True)
    
    is_featured = models.BooleanField(default=False)
    
    # Computed fields for performance and tree structures
    path = models.CharField(max_length=1000, blank=True, db_index=True)
    level = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        return f"{self.path or self.name}"

    def clean(self):
        super().clean()
        if self.parent:
            # Check maximum depth (10 levels)
            # Level 0 is root. Level 9 is the 10th level.
            if self.parent.level >= 9:
                raise ValidationError({"parent": "Maximum category depth of 10 levels exceeded."})
            
            # Check for circular reference
            parent = self.parent
            while parent:
                if parent.id == self.id:
                    raise ValidationError({"parent": "Circular reference detected."})
                parent = parent.parent
