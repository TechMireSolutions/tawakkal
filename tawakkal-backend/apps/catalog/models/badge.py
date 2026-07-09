from django.db import models
from apps.core.models import BaseModel
from apps.media.models import Media

class Badge(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    
    icon = models.ForeignKey(
        Media, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='badge_icons'
    )
    
    background_color = models.CharField(max_length=50, blank=True, help_text="e.g. #FF0000 or red")
    text_color = models.CharField(max_length=50, blank=True, help_text="e.g. #FFFFFF or white")
    
    status = models.BooleanField(default=True, help_text="Active/Inactive")
    display_order = models.PositiveIntegerField(default=0)
    priority = models.PositiveIntegerField(default=0, help_text="Higher priority renders first (Top)")

    class Meta:
        ordering = ['-priority', 'display_order', 'name']
        verbose_name_plural = 'Badges'

    def __str__(self):
        return self.name
