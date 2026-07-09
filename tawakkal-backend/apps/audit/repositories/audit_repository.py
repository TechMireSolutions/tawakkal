from django.db.models import Count, Avg, Sum, F, Q
from django.utils import timezone
from datetime import timedelta
from apps.audit.models import AuditLog, LoginHistory, ApiRequestLog, ErrorLog

class AuditRepository:
    @staticmethod
    def get_today_statistics():
        today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Today's logs
        total_logs = AuditLog.objects.filter(created_at__gte=today).count()
        
        # Logins
        logins = LoginHistory.objects.filter(timestamp__gte=today)
        successful_logins = logins.filter(status='SUCCESS').count()
        failed_logins = logins.filter(status='FAILED').count()
        
        # API requests
        api_requests = ApiRequestLog.objects.filter(timestamp__gte=today)
        avg_request_duration = api_requests.aggregate(Avg('execution_time'))['execution_time__avg'] or 0
        total_api_requests = api_requests.count()
        requests_per_minute = total_api_requests / (24 * 60) if total_api_requests > 0 else 0
        
        # Errors
        errors_today = ErrorLog.objects.filter(timestamp__gte=today).count()
        
        # Most active users
        active_users = AuditLog.objects.filter(created_at__gte=today).exclude(user__isnull=True).values(
            'user__email', 'user__first_name', 'user__last_name'
        ).annotate(count=Count('id')).order_by('-count')[:5]
        
        # Most modified modules
        modified_modules = AuditLog.objects.filter(created_at__gte=today).values('module').annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        return {
            'total_activity_logs': total_logs,
            'successful_logins': successful_logins,
            'failed_logins': failed_logins,
            'avg_request_duration_sec': round(avg_request_duration, 4),
            'requests_per_minute': round(requests_per_minute, 2),
            'errors_today': errors_today,
            'most_active_users': list(active_users),
            'most_modified_modules': list(modified_modules)
        }
