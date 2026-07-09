from django.utils import timezone
from apps.audit.models import (
    AuditLog, LoginHistory, SystemEvent, ApiRequestLog, ErrorLog, ActivityTimeline
)

class AuditService:
    @staticmethod
    def log_action(user, action, module, entity_type, entity_id, old_values=None, new_values=None, ip_address=None, user_agent=None, request_method=None, endpoint=None, severity='INFO'):
        log = AuditLog.objects.create(
            user=user,
            action=action,
            module=module,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else '',
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
            request_method=request_method,
            endpoint=endpoint,
            severity=severity
        )
        
        # Also create a timeline entry for quick activity feed
        if user:
            ActivityTimeline.objects.create(
                user=user,
                description=f"{action} on {entity_type} {entity_id}",
                module=module,
                entity_id=str(entity_id) if entity_id else ''
            )
        return log

    @staticmethod
    def log_login_event(user, action, status, browser=None, device=None, os=None, ip_address=None):
        return LoginHistory.objects.create(
            user=user,
            action=action,
            status=status,
            browser=browser,
            device=device,
            operating_system=os,
            ip_address=ip_address
        )

    @staticmethod
    def log_system_event(event_type, description, status, triggered_by=None, metadata=None):
        return SystemEvent.objects.create(
            event_type=event_type,
            description=description,
            status=status,
            triggered_by=triggered_by,
            metadata=metadata or {}
        )

    @staticmethod
    def log_api_request(endpoint, method, response_code, execution_time, authenticated_user=None, request_size=None, response_size=None, ip_address=None):
        return ApiRequestLog.objects.create(
            endpoint=endpoint,
            method=method,
            response_code=response_code,
            execution_time=execution_time,
            authenticated_user=authenticated_user,
            request_size=request_size,
            response_size=response_size,
            ip_address=ip_address
        )

    @staticmethod
    def log_error(error_type, message, traceback=None, user=None, endpoint=None):
        return ErrorLog.objects.create(
            error_type=error_type,
            message=message,
            traceback=traceback,
            user=user,
            endpoint=endpoint
        )
