import time
import json
from django.utils.deprecation import MiddlewareMixin
from apps.audit.services.audit_service import AuditService
from apps.audit.utils import get_client_ip

class AuditMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
        
    def process_response(self, request, response):
        if not hasattr(request, 'start_time'):
            return response
            
        execution_time = time.time() - request.start_time
        
        # Don't log if it's purely static or media
        if request.path.startswith('/media/') or request.path.startswith('/static/'):
            return response
            
        # We might only want to log API requests
        if not request.path.startswith('/api/'):
            return response

        # Size of request body
        try:
            req_size = len(request.body)
        except Exception:
            req_size = 0
            
        # Size of response
        try:
            res_size = len(response.content)
        except Exception:
            res_size = 0
            
        user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None
        
        AuditService.log_api_request(
            endpoint=request.path,
            method=request.method,
            response_code=response.status_code,
            execution_time=execution_time,
            authenticated_user=user,
            request_size=req_size,
            response_size=res_size,
            ip_address=get_client_ip(request)
        )
        
        # Log permissions denied
        if response.status_code in [401, 403]:
            AuditService.log_error(
                error_type='PERMISSION_DENIAL',
                message=f'Access denied to {request.path}',
                user=user,
                endpoint=request.path
            )
            
        # Log validation failures (400)
        if response.status_code == 400:
            try:
                # Truncate content in case it's huge
                msg = response.content.decode('utf-8')[:500]
            except:
                msg = "Validation failed"
                
            AuditService.log_error(
                error_type='VALIDATION_FAILURE',
                message=msg,
                user=user,
                endpoint=request.path
            )
            
        return response

    def process_exception(self, request, exception):
        user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None
        import traceback
        tb = ''.join(traceback.format_exception(type(exception), exception, exception.__traceback__))
        
        AuditService.log_error(
            error_type='UNHANDLED_EXCEPTION',
            message=str(exception),
            traceback=tb,
            user=user,
            endpoint=request.path
        )
        return None # Let Django handle the rest of exception processing
