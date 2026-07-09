from django.urls import path
from .views import SiteSettingsAPIView, SystemConfigAPIView

urlpatterns = [
    path('site/', SiteSettingsAPIView.as_view(), name='site-settings'),
    path('system/', SystemConfigAPIView.as_view(), name='system-config'),
]
