from django.urls import path
from .views.analytics_views import AnalyticsViewSet

urlpatterns = [
    path('dashboard-stats/', AnalyticsViewSet.as_view({'get': 'dashboard_stats'}), name='dashboard-stats'),
    path('recent-activity/', AnalyticsViewSet.as_view({'get': 'recent_activity'}), name='recent-activity'),
    path('overview/', AnalyticsViewSet.as_view({'get': 'overview'}), name='overview'),
]
