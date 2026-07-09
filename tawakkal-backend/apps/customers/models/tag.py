from django.db import models
from apps.core.models import BaseModel

class CustomerTag(BaseModel):
    name = models.CharField(max_length=50, unique=True, db_index=True)
    slug = models.SlugField(max_length=50, unique=True)
    color = models.CharField(max_length=20, blank=True, help_text="Hex code for UI tag color")

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
