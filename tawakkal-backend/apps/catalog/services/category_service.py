from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.db import transaction
from apps.core.services import BaseService
from ..repositories.category_repository import CategoryRepository
from ..models.category import Category

class CategoryService(BaseService):
    repository = CategoryRepository

    @classmethod
    def _generate_unique_slug(cls, name, exclude_id=None):
        base_slug = slugify(name)
        slug = base_slug
        counter = 2
        qs = Category.all_objects.filter(slug=slug)
        if exclude_id:
            qs = qs.exclude(id=exclude_id)
            
        while qs.exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
            qs = Category.all_objects.filter(slug=slug)
            if exclude_id:
                qs = qs.exclude(id=exclude_id)
        return slug

    @classmethod
    def _update_path_and_level(cls, instance):
        if instance.parent:
            instance.level = instance.parent.level + 1
            instance.path = f"{instance.parent.path}/{instance.name}"
        else:
            instance.level = 0
            instance.path = instance.name

    @classmethod
    def _update_descendants_path_and_level(cls, category):
        """Recursively update path and level of all descendants when a parent moves."""
        children = Category.objects.filter(parent=category)
        for child in children:
            cls._update_path_and_level(child)
            child.save(update_fields=['level', 'path'])
            cls._update_descendants_path_and_level(child)

    @classmethod
    @transaction.atomic
    def create(cls, user=None, request=None, **kwargs):
        if not kwargs.get('slug') and kwargs.get('name'):
            kwargs['slug'] = cls._generate_unique_slug(kwargs['name'])
            
        # We temporarily create instance to run clean and update path
        instance = Category(**kwargs)
        instance.clean()
        cls._update_path_and_level(instance)
        
        # Pass updated values back to kwargs for BaseService creation
        kwargs['slug'] = instance.slug
        kwargs['level'] = instance.level
        kwargs['path'] = instance.path
        
        return super().create(user=user, request=request, **kwargs)

    @classmethod
    @transaction.atomic
    def update(cls, instance, user=None, request=None, **kwargs):
        old_parent_id = instance.parent_id
        old_name = instance.name
        
        if 'name' in kwargs and not kwargs.get('slug') and kwargs['name'] != instance.name:
            kwargs['slug'] = cls._generate_unique_slug(kwargs['name'], exclude_id=instance.id)

        # Apply kwargs to a temporary instance to validate clean()
        temp_instance = Category.objects.get(id=instance.id)
        for k, v in kwargs.items():
            setattr(temp_instance, k, v)
        temp_instance.clean()
        
        cls._update_path_and_level(temp_instance)
        kwargs['level'] = temp_instance.level
        kwargs['path'] = temp_instance.path
        
        updated_instance = super().update(instance, user=user, request=request, **kwargs)
        
        # If parent or name changed, update all descendants paths
        if old_parent_id != updated_instance.parent_id or old_name != updated_instance.name:
            cls._update_descendants_path_and_level(updated_instance)
            
        return updated_instance

    @classmethod
    def soft_delete(cls, instance, user=None, request=None):
        if Category.objects.filter(parent=instance).exists():
            raise ValidationError("Cannot delete category with active children. Please reassign or delete children first.")
        return super().soft_delete(instance, user=user, request=request)

    @classmethod
    @transaction.atomic
    def bulk_delete(cls, ids, user=None, request=None):
        deleted = []
        for cat_id in ids:
            cat = Category.objects.get(id=cat_id)
            cls.soft_delete(cat, user=user, request=request)
            deleted.append(cat)
        return deleted

    @classmethod
    @transaction.atomic
    def bulk_restore(cls, ids, user=None, request=None):
        restored = []
        for cat_id in ids:
            cat = Category.all_objects.get(id=cat_id)
            cls.restore(cat, user=user, request=request)
            restored.append(cat)
        return restored

    @classmethod
    @transaction.atomic
    def bulk_status_change(cls, ids, status, user=None, request=None):
        updated = []
        for cat_id in ids:
            cat = Category.objects.get(id=cat_id)
            cls.update(cat, user=user, request=request, status=status)
            updated.append(cat)
        return updated
        
    @classmethod
    @transaction.atomic
    def bulk_reorder(cls, category_ids, user=None, request=None):
        # We use repository reorder but we should also track audit log if needed.
        # Since it's bulk and many records, it's fine to just use repo for now.
        cls.repository().reorder(category_ids)
        return True
