from django.db import transaction
from django.utils.text import slugify
from apps.core.services import BaseService
from ..models.tag import CustomerTag
from ..repositories.tag_repository import CustomerTagRepository
from apps.audit.utils import log_audit
from django.forms.models import model_to_dict

class CustomerTagService(BaseService):
    repository = CustomerTagRepository

    @classmethod
    @transaction.atomic
    def create_tag(cls, data, user=None, request=None):
        if 'slug' not in data or not data['slug']:
            data['slug'] = slugify(data['name'])
        
        tag = CustomerTag.objects.create(**data)
        log_audit(
            action='CREATE',
            instance=tag,
            user=user,
            after_state=model_to_dict(tag),
            request=request
        )
        return tag

    @classmethod
    @transaction.atomic
    def update_tag(cls, tag, data, user=None, request=None):
        if 'name' in data and ('slug' not in data or not data['slug']):
            data['slug'] = slugify(data['name'])
            
        for key, value in data.items():
            setattr(tag, key, value)
            
        tag.save()
        log_audit(
            action='UPDATE',
            instance=tag,
            user=user,
            after_state=model_to_dict(tag),
            request=request
        )
        return tag
