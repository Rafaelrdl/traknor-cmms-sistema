from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Company, Sector, SubSection
from .serializers import (
    CompanySerializer, 
    CompanyCreateSerializer, 
    SectorSerializer, 
    SubSectionSerializer
)


class CompanyViewSet(viewsets.ModelViewSet):
    """Companies endpoint that matches mock server (/api/companies)"""
    queryset = Company.objects.all().prefetch_related('sectors__subsections')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanySerializer
    
    def list(self, request, *args, **kwargs):
        """List companies with sectors"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new company"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Handle address data manually
        validated_data = serializer.validated_data.copy()
        if 'address' in request.data:
            address_data = request.data['address']
            validated_data.update({
                'address_zip': address_data.get('zip', ''),
                'address_city': address_data.get('city', ''),
                'address_state': address_data.get('state', ''),
                'address_full': address_data.get('fullAddress', ''),
            })
        
        company = Company.objects.create(**validated_data)
        
        return Response({
            'success': True,
            'data': CompanySerializer(company).data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """Get company by ID"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """Update company"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Handle address data manually
        if 'address' in request.data:
            address_data = request.data['address']
            instance.address_zip = address_data.get('zip', instance.address_zip)
            instance.address_city = address_data.get('city', instance.address_city)
            instance.address_state = address_data.get('state', instance.address_state)
            instance.address_full = address_data.get('fullAddress', instance.address_full)
        
        # Handle role mapping
        if 'role' in request.data:
            instance.responsible_role = request.data['role']
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'data': CompanySerializer(instance).data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete company"""
        instance = self.get_object()
        instance.delete()
        
        return Response({
            'success': True,
            'data': {'message': 'Empresa removida com sucesso'}
        })


class SectorViewSet(viewsets.ModelViewSet):
    """Sectors endpoint"""
    queryset = Sector.objects.all().prefetch_related('subsections')
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sector = serializer.save()
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)


class SubSectionViewSet(viewsets.ModelViewSet):
    """SubSections endpoint"""
    queryset = SubSection.objects.all()
    serializer_class = SubSectionSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subsection = serializer.save()
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)