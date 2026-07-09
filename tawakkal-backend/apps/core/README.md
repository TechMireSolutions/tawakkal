# Core Infrastructure Guide

This guide explains how to use the shared core infrastructure to implement new modules in the Tawakkal Luxury Django REST API.

## 1. Creating Models using BaseModel

All primary business models must inherit from `apps.core.models.BaseModel`.

```python
from apps.core.models import BaseModel
from django.db import models

class Product(BaseModel):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
```

By inheriting `BaseModel`, your model automatically receives:
- `id`: UUID primary key.
- `created_at` & `updated_at`: Timestamps.
- `created_by` & `updated_by`: References to the User who performed the action.
- `is_deleted` & `deleted_at`: Soft delete tracking.
- `objects`: A `SafeDeleteManager` which filters out soft-deleted records.
- `all_objects`: A manager that includes deleted records.
- `soft_delete()` and `restore()` methods.

## 2. Implementing Repositories

The Repository layer handles all database interactions. Inherit from `apps.core.repositories.BaseRepository`.

```python
from apps.core.repositories import BaseRepository
from .models import Product

class ProductRepository(BaseRepository):
    model = Product
```

Inheriting `BaseRepository` provides generic `create`, `update`, `soft_delete`, `restore`, `hard_delete`, `get_by_id`, and `get_queryset` methods. You can override or add custom querying logic here.

## 3. Implementing Services

The Service layer encapsulates business logic and automatically handles Audit Logging. Inherit from `apps.core.services.BaseService`.

```python
from apps.core.services import BaseService
from .repositories import ProductRepository

class ProductService(BaseService):
    repository = ProductRepository

    @classmethod
    def create(cls, user, request, **kwargs):
        # Add custom validation or side-effects here
        return super().create(user=user, request=request, **kwargs)
```

By calling `super().create()`, `super().update()`, etc., the service will automatically log the action (CREATE, UPDATE, DELETE, RESTORE) to the `AuditLog` table.

## 4. Audit Logging Mechanism

Audit logging is completely centralized via `apps.audit.utils.log_audit`. 

- **Automatic Logging:** When you use `BaseService` or the DRF mixins (`SoftDeleteModelMixin`), audit logs are created automatically.
- **Immutability:** The `AuditLog` model is designed to be immutable. Once a log is created, any `save()` updates are silently ignored by the database.
- **Manual Logging:** You can log custom events:
  ```python
  from apps.audit.utils import log_audit
  
  log_audit(action='CUSTOM', instance=obj, user=request.user, after_state={'status': 'completed'}, request=request)
  ```

## 5. Soft Deletion Mechanism

Soft deletion is the default deletion method.
- `Product.objects.all()` excludes deleted items.
- `Product.objects.deleted()` returns only deleted items.
- `Product.all_objects.all()` returns both.
- ViewSets should use `SoftDeleteModelMixin` to ensure soft deletion via the API automatically cascades down to the service layer, writing an audit log in the process.

## 6. Global Mixins and Utilities

- **Global Exceptions:** Any raised exceptions are automatically caught and standardized by `custom_exception_handler` if `settings.EXCEPTION_HANDLER` is active.
- **Mixins:** Apply `SoftDeleteModelMixin` or `RestoreModelMixin` to your ViewSets to handle those actions smoothly.
