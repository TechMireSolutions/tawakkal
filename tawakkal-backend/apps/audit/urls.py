from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.audit.views import (
    AuditLogViewSet, LoginHistoryViewSet, SystemEventViewSet,
    ApiRequestLogViewSet, ErrorLogViewSet
)

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='auditlog')
router.register(r'login-history', LoginHistoryViewSet, basename='loginhistory')
router.register(r'api-requests', ApiRequestLogViewSet, basename='apirequest')
router.register(r'errors', ErrorLogViewSet, basename='error')
router.register(r'system-events', SystemEventViewSet, basename='systemevent')

urlpatterns = [
    path('', include(router.urls)),
]
