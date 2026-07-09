from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from .customer import Customer

class CustomerNote(BaseModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='internal_notes')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='authored_customer_notes')
    text = models.TextField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note by {self.author} for {self.customer.full_name}"
