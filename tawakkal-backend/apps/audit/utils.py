from django.forms.models import model_to_dict
from apps.audit.services.audit_service import AuditService

def get_client_ip(request):
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_user_agent(request):
    if not request:
        return None
    return request.META.get('HTTP_USER_AGENT')

def log_audit(action, instance, user=None, before_state=None, after_state=None, request=None):
    """
    Utility to record an audit log, bridging legacy calls to AuditService.
    """
    def clean_state(state):
        if not state:
            return None
        cleaned = {}
        for k, v in state.items():
            if k.startswith('_'):
                continue
            if hasattr(v, 'url'):
                cleaned[k] = v.url if v else None
            elif hasattr(v, 'name'):
                cleaned[k] = v.name if v else None
            else:
                cleaned[k] = v
        return cleaned

    ip_address = get_client_ip(request)
    user_agent = get_user_agent(request)
    
    if after_state is None and instance:
        after_state = model_to_dict(instance)
    
    method = request.method if request else None
    endpoint = request.path if request else None
    
    AuditService.log_action(
        user=user,
        action=action,
        module=instance._meta.app_label,
        entity_type=instance._meta.object_name,
        entity_id=instance.pk,
        old_values=clean_state(before_state),
        new_values=clean_state(after_state),
        ip_address=ip_address,
        user_agent=user_agent,
        request_method=method,
        endpoint=endpoint,
        severity='INFO'
    )
