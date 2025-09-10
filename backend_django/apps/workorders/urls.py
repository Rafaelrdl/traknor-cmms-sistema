from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import WorkOrderViewSet

# Create router for work orders - WITH HYPHEN as per mock server!
router = DefaultRouter()
router.register(r'work-orders', WorkOrderViewSet, basename='workorder')

urlpatterns = [
    path('', include(router.urls)),
]