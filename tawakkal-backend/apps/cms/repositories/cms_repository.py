from django.db.models import Q
from apps.cms.models import PublishStatus

class CmsRepository:
    """
    Generic repository for CMS content.
    """
    
    @classmethod
    def get_queryset(cls, model_class, user=None):
        """
        Base queryset that automatically handles soft deletes.
        Admins can see everything, regular users only published.
        Actually, this is for the Admin API, so they see everything that is not soft deleted.
        """
        qs = model_class.objects.all()
        # The manager handles is_deleted=False automatically
        return qs

    @classmethod
    def get_published(cls, model_class):
        """
        Get only published and active items.
        """
        qs = model_class.objects.filter(status=PublishStatus.PUBLISHED, is_active=True)
        return qs

    @classmethod
    def get_by_slug(cls, model_class, slug):
        return model_class.objects.filter(slug=slug, status=PublishStatus.PUBLISHED, is_active=True).first()

    @classmethod
    def create(cls, model_class, **kwargs):
        m2m_data = {}
        for field in model_class._meta.many_to_many:
            if field.name in kwargs:
                m2m_data[field.name] = kwargs.pop(field.name)
        
        instance = model_class.objects.create(**kwargs)
        
        for field_name, items in m2m_data.items():
            getattr(instance, field_name).set(items)
            
        return instance

    @classmethod
    def update(cls, instance, **kwargs):
        m2m_data = {}
        for field in instance._meta.many_to_many:
            if field.name in kwargs:
                m2m_data[field.name] = kwargs.pop(field.name)
                
        for attr, value in kwargs.items():
            setattr(instance, attr, value)
        instance.save()
        
        for field_name, items in m2m_data.items():
            getattr(instance, field_name).set(items)
            
        return instance

    @classmethod
    def delete(cls, instance):
        instance.soft_delete()
        
    @classmethod
    def hard_delete(cls, instance):
        instance.delete()
