import os
from django.db import models
from apps.core.models import BaseModel
import mimetypes

def get_upload_path(instance, filename):
    # Upload path could be customized based on date or file type
    return f'uploads/{instance.id}/{filename}'

class Media(BaseModel):
    file = models.FileField(upload_to=get_upload_path)
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    size = models.PositiveBigIntegerField(help_text="File size in bytes")
    width = models.PositiveIntegerField(null=True, blank=True, help_text="Image width in pixels")
    height = models.PositiveIntegerField(null=True, blank=True, help_text="Image height in pixels")
    alt_text = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Media"
        ordering = ['-created_at']

    def __str__(self):
        return self.original_filename

    def save(self, *args, **kwargs):
        if not self.original_filename and self.file:
            self.original_filename = os.path.basename(self.file.name)
            
        if not self.mime_type and self.file:
            mime_type, _ = mimetypes.guess_type(self.file.name)
            self.mime_type = mime_type or 'application/octet-stream'
            
        super().save(*args, **kwargs)
