from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CompanyViewSet, SectorViewSet, SubSectionViewSet

# Create router for companies
router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'sectors', SectorViewSet, basename='sector')
router.register(r'subsections', SubSectionViewSet, basename='subsection')

urlpatterns = [
    path('', include(router.urls)),
]