from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Equipment
from .serializers import (
    EquipmentSerializer, 
    EquipmentCreateSerializer,
    EquipmentSummarySerializer
)


class EquipmentViewSet(viewsets.ModelViewSet):
    """Equipment endpoint that matches mock server (/api/equipment)"""
    queryset = Equipment.objects.all().select_related(
        'company', 'sector', 'subsection'
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Filtering options
    filterset_fields = ['type', 'status', 'criticality', 'company', 'sector']
    search_fields = ['name', 'code', 'model', 'manufacturer', 'location']
    ordering_fields = ['name', 'code', 'install_date', 'next_maintenance']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EquipmentCreateSerializer
        elif self.action == 'list' and self.request.query_params.get('summary'):
            return EquipmentSummarySerializer
        return EquipmentSerializer
    
    def list(self, request, *args, **kwargs):
        """List equipment - matches mock server format"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Handle pagination if needed
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            # Modify the response to match mock format
            return Response({
                'success': True,
                'data': paginated_response.data['results'],
                'meta': {
                    'total': paginated_response.data['count'],
                    'page': request.query_params.get('page', 1),
                    'per_page': self.paginator.page_size,
                    'total_pages': (paginated_response.data['count'] + self.paginator.page_size - 1) // self.paginator.page_size
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """Create new equipment"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        equipment = serializer.save()
        
        return Response({
            'success': True,
            'data': EquipmentSerializer(equipment).data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """Get equipment by ID"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """Update equipment"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete equipment"""
        instance = self.get_object()
        instance.delete()
        
        return Response({
            'success': True,
            'data': {'message': 'Equipamento removido com sucesso'}
        })
    
    @action(detail=False, methods=['get'])
    def by_company(self, request):
        """Get equipment filtered by company"""
        company_id = request.query_params.get('company_id')
        if not company_id:
            return Response({
                'success': False,
                'error': {
                    'message': 'company_id parameter is required',
                    'code': 'MISSING_PARAMETER'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(company_id=company_id)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def by_sector(self, request):
        """Get equipment filtered by sector"""
        sector_id = request.query_params.get('sector_id')
        if not sector_id:
            return Response({
                'success': False,
                'error': {
                    'message': 'sector_id parameter is required',
                    'code': 'MISSING_PARAMETER'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(sector_id=sector_id)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def maintenance_complete(self, request, pk=None):
        """Mark maintenance as complete"""
        equipment = self.get_object()
        
        from datetime import date
        equipment.last_maintenance = date.today()
        
        # Calculate next maintenance based on equipment type
        if equipment.type in ['SPLIT', 'VRF']:
            # Every 3 months
            from datetime import timedelta
            equipment.next_maintenance = date.today() + timedelta(days=90)
        elif equipment.type in ['CENTRAL', 'CHILLER']:
            # Every 6 months
            from datetime import timedelta
            equipment.next_maintenance = date.today() + timedelta(days=180)
        
        equipment.save()
        
        return Response({
            'success': True,
            'data': self.get_serializer(equipment).data
        })