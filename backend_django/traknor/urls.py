from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from apps.core.views import HealthCheckView, db_health

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints - MATCHING MOCK SERVER EXACTLY
    path('api/', include([
        # Health check
        path('health', HealthCheckView.as_view(), name='health-check'),
        path('health/db/', db_health, name='db-health'),
        
        # Authentication routes
        path('auth/', include('apps.accounts.urls')),
        
        # Main resource routes
        path('', include('apps.companies.urls')),
        path('', include('apps.equipment.urls')),
        path('', include('apps.workorders.urls')),
        path('', include('apps.accounts.user_urls')),  # For /api/users
    ])),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]