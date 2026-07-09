from django.utils.text import slugify
from apps.cms.repositories.cms_repository import CmsRepository
import uuid

class CmsService:
    """
    Generic service for CMS logic like slug generation and lifecycle.
    """

    @classmethod
    def get_queryset(cls, model_class):
        return CmsRepository.get_queryset(model_class)

    @classmethod
    def create_instance(cls, model_class, validated_data):
        cls._handle_slug(model_class, validated_data)
        return CmsRepository.create(model_class, **validated_data)

    @classmethod
    def update_instance(cls, instance, validated_data):
        cls._handle_slug(instance.__class__, validated_data, instance)
        return CmsRepository.update(instance, **validated_data)

    @classmethod
    def delete_instance(cls, instance):
        CmsRepository.delete(instance)

    @classmethod
    def _handle_slug(cls, model_class, data, instance=None):
        if 'slug' in [f.name for f in model_class._meta.get_fields()] and 'title' in data:
            if not data.get('slug'):
                base_slug = slugify(data['title'])
                slug = base_slug
                counter = 1
                qs = model_class.all_objects.filter(slug=slug)
                if instance:
                    qs = qs.exclude(pk=instance.pk)
                
                while qs.exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                    qs = model_class.all_objects.filter(slug=slug)
                    if instance:
                        qs = qs.exclude(pk=instance.pk)
                data['slug'] = slug
        elif 'slug' in [f.name for f in model_class._meta.get_fields()] and 'name' in data:
            if not data.get('slug'):
                base_slug = slugify(data['name'])
                slug = base_slug
                counter = 1
                qs = model_class.all_objects.filter(slug=slug)
                if instance:
                    qs = qs.exclude(pk=instance.pk)
                
                while qs.exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                    qs = model_class.all_objects.filter(slug=slug)
                    if instance:
                        qs = qs.exclude(pk=instance.pk)
                data['slug'] = slug
