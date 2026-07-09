from apps.audit.utils import log_audit
from django.forms.models import model_to_dict

class BaseService:
    """
    Base Service encapsulating common business logic and audit logging.
    """
    repository = None  # Should be overridden by subclasses

    @classmethod
    def create(cls, user=None, request=None, **kwargs):
        # Validation hooks can go here
        instance = cls.repository.create(**kwargs)
        
        # Log Audit
        log_audit(
            action='CREATE',
            instance=instance,
            user=user,
            after_state=model_to_dict(instance),
            request=request
        )
        return instance

    @classmethod
    def update(cls, instance, user=None, request=None, **kwargs):
        before_state = model_to_dict(instance)
        
        updated_instance = cls.repository.update(instance, **kwargs)
        
        log_audit(
            action='UPDATE',
            instance=updated_instance,
            user=user,
            before_state=before_state,
            after_state=model_to_dict(updated_instance),
            request=request
        )
        return updated_instance

    @classmethod
    def soft_delete(cls, instance, user=None, request=None):
        before_state = model_to_dict(instance)
        if cls.repository.soft_delete(instance):
            log_audit(
                action='DELETE',
                instance=instance,
                user=user,
                before_state=before_state,
                after_state=model_to_dict(instance),
                request=request
            )
            return True
        return False

    @classmethod
    def restore(cls, instance, user=None, request=None):
        before_state = model_to_dict(instance)
        if cls.repository.restore(instance):
            log_audit(
                action='RESTORE',
                instance=instance,
                user=user,
                before_state=before_state,
                after_state=model_to_dict(instance),
                request=request
            )
            return True
        return False

from .repositories import SiteSettingsRepository, SystemConfigRepository

class SiteSettingsService:
    @staticmethod
    def get_settings():
        return SiteSettingsRepository.get_settings()

    @staticmethod
    def update_settings(data, user=None, request=None):
        settings = SiteSettingsRepository.get_settings()
        before_state = model_to_dict(settings)
        if user:
            data['updated_by'] = user
        updated = SiteSettingsRepository.update(settings, **data)
        log_audit(action='UPDATE', instance=updated, user=user, before_state=before_state, after_state=model_to_dict(updated), request=request)
        return updated

class SystemConfigService:
    @staticmethod
    def get_config():
        return SystemConfigRepository.get_config()

    @staticmethod
    def update_config(data, user=None, request=None):
        config = SystemConfigRepository.get_config()
        before_state = model_to_dict(config)
        if user:
            data['updated_by'] = user
        updated = SystemConfigRepository.update(config, **data)
        log_audit(action='UPDATE', instance=updated, user=user, before_state=before_state, after_state=model_to_dict(updated), request=request)
        return updated
