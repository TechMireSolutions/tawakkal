from django.db import models
from django.utils.text import slugify
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

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while self.__class__.all_objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
