from django.core.exceptions import ObjectDoesNotExist
from django.db import models

class BaseRepository:
    """
    Base Repository encapsulating generic data access logic.
    """
    model = None  # Should be overridden by subclasses

    @classmethod
    def get_queryset(cls, include_deleted=False):
        if include_deleted and hasattr(cls.model, 'all_objects'):
            return cls.model.all_objects.all()
        return cls.model.objects.all()

    @classmethod
    def get_by_id(cls, obj_id, include_deleted=False):
        try:
            return cls.get_queryset(include_deleted).get(pk=obj_id)
        except ObjectDoesNotExist:
            return None

    @classmethod
    def create(cls, **kwargs):
        return cls.model.objects.create(**kwargs)

    @classmethod
    def update(cls, instance, **kwargs):
        for key, value in kwargs.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @classmethod
    def soft_delete(cls, instance):
        if hasattr(instance, 'soft_delete'):
            instance.soft_delete()
            return True
        return False

    @classmethod
    def restore(cls, instance):
        if hasattr(instance, 'restore'):
            instance.restore()
            return True
        return False

    @classmethod
    def hard_delete(cls, instance):
        instance.delete()
        return True

from .models import SiteSettings, SystemConfig

class SiteSettingsRepository(BaseRepository):
    model = SiteSettings

    @classmethod
    def get_settings(cls):
        return cls.model.load()

class SystemConfigRepository(BaseRepository):
    model = SystemConfig

    @classmethod
    def get_config(cls):
        return cls.model.load()

