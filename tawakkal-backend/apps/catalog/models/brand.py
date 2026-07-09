from django.db import models
from apps.core.models import BaseModel
from apps.media.models import Media

class Brand(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.TextField(blank=True)
    
    logo = models.ForeignKey(
        Media, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='brand_logos'
    )
    cover_image = models.ForeignKey(
        Media, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='brand_covers'
    )
    
    status = models.BooleanField(default=True, help_text="Active/Inactive")
    display_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    
    # SEO Fields
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Brands'

    def __str__(self):
        return self.name
