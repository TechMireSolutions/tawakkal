"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('backend-admin/', admin.site.urls),
    
    # OpenAPI Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints
    path('api/v1/admin/auth/', include('apps.users.urls')),
    path('api/v1/admin/media/', include('apps.media.urls')),
    path('api/v1/admin/catalog/', include('apps.catalog.urls')),
    path('api/v1/admin/customers/', include('apps.customers.urls')),
    path('api/v1/admin/orders/', include('apps.orders.urls')),
    path('api/v1/admin/payments/', include('apps.payments.urls')),
    path('api/v1/admin/shipping/', include('apps.shipping.urls')),
    path('api/v1/admin/analytics/', include('apps.analytics.urls')),
    path('api/v1/admin/cms/', include('apps.cms.urls')),
    path('api/v1/admin/surveys/', include('apps.surveys.urls')),
    path('api/v1/admin/stores/', include('apps.stores.urls')),
    path('api/v1/admin/notifications/', include('apps.notifications.urls')),
    path('api/v1/admin/audit/', include('apps.audit.urls')),
    path('api/v1/admin/settings/', include('apps.core.urls')),
]

from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from django.views.static import serve

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
