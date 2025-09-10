from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from django.utils import timezone

from .models import WorkOrder, WorkOrderTask
from .serializers import (
    WorkOrderSerializer,
    WorkOrderCreateSerializer, 
    WorkOrderSummarySerializer,
    WorkOrderTaskSerializer
)


class WorkOrderViewSet(viewsets.ModelViewSet):
    """Work Orders endpoint that matches mock server (/api/work-orders)"""
    queryset = WorkOrder.objects.all().select_related(
        'assigned_to', 'requested_by', 'company', 'sector'
    ).prefetch_related('equipment', 'tasks', 'comments')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Filtering options
    filterset_fields = ['type', 'status', 'priority', 'assigned_to', 'company']
    search_fields = ['code', 'title', 'description']
    ordering_fields = ['created_at', 'scheduled_date', 'priority', 'code']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WorkOrderCreateSerializer
        elif self.action == 'list' and self.request.query_params.get('summary'):
            return WorkOrderSummarySerializer
        return WorkOrderSerializer
    
    def list(self, request, *args, **kwargs):
        """List work orders - matches mock server format"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Handle pagination if needed
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'data': paginated_response.data['results'],
                'meta': {
                    'total': paginated_response.data['count'],
                    'page': int(request.query_params.get('page', 1)),
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
        """Create new work order"""
        # Set requested_by to current user if not provided
        if 'requested_by' not in request.data:
            request.data['requested_by'] = request.user.id
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        work_order = serializer.save()
        
        return Response({
            'success': True,
            'data': WorkOrderSerializer(work_order).data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """Get work order by ID"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """Update work order"""
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
        """Delete work order"""
        instance = self.get_object()
        instance.delete()
        
        return Response({
            'success': True,
            'data': {'message': 'Ordem de serviço removida com sucesso'}
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get work order statistics - matches validation script"""
        queryset = self.get_queryset()
        
        # Count by status
        stats = {
            'total': queryset.count(),
            'pending': queryset.filter(status='PENDING').count(),
            'in_progress': queryset.filter(status='IN_PROGRESS').count(),
            'scheduled': queryset.filter(status='SCHEDULED').count(),
            'completed': queryset.filter(status='COMPLETED').count(),
            'cancelled': queryset.filter(status='CANCELLED').count(),
        }
        
        # Count by priority
        stats.update({
            'critical': queryset.filter(priority='CRITICAL').count(),
            'high': queryset.filter(priority='HIGH').count(),
            'medium': queryset.filter(priority='MEDIUM').count(),
            'low': queryset.filter(priority='LOW').count(),
        })
        
        # Count by type
        stats.update({
            'preventive': queryset.filter(type='PREVENTIVE').count(),
            'corrective': queryset.filter(type='CORRECTIVE').count(),
            'inspection': queryset.filter(type='INSPECTION').count(),
            'testing': queryset.filter(type='TESTING').count(),
        })
        
        return Response({
            'success': True,
            'data': stats
        })
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a work order"""
        work_order = self.get_object()
        
        if work_order.status != 'PENDING':
            return Response({
                'success': False,
                'error': {
                    'message': 'Work order must be in PENDING status to start',
                    'code': 'INVALID_STATUS'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        work_order.status = 'IN_PROGRESS'
        work_order.started_at = timezone.now()
        work_order.save()
        
        return Response({
            'success': True,
            'data': WorkOrderSerializer(work_order).data
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a work order"""
        work_order = self.get_object()
        
        if work_order.status not in ['PENDING', 'IN_PROGRESS']:
            return Response({
                'success': False,
                'error': {
                    'message': 'Work order must be in PENDING or IN_PROGRESS status to complete',
                    'code': 'INVALID_STATUS'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        work_order.status = 'COMPLETED'
        work_order.completed_at = timezone.now()
        
        # Get completion notes from request
        completion_notes = request.data.get('completion_notes', '')
        if completion_notes:
            work_order.completion_notes = completion_notes
        
        work_order.save()
        
        return Response({
            'success': True,
            'data': WorkOrderSerializer(work_order).data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a work order"""
        work_order = self.get_object()
        
        if work_order.status in ['COMPLETED', 'CANCELLED']:
            return Response({
                'success': False,
                'error': {
                    'message': 'Cannot cancel a completed or already cancelled work order',
                    'code': 'INVALID_STATUS'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        work_order.status = 'CANCELLED'
        work_order.save()
        
        return Response({
            'success': True,
            'data': WorkOrderSerializer(work_order).data
        })
    
    @action(detail=True, methods=['get', 'post'])
    def tasks(self, request, pk=None):
        """Manage tasks for a work order"""
        work_order = self.get_object()
        
        if request.method == 'GET':
            tasks = work_order.tasks.all()
            serializer = WorkOrderTaskSerializer(tasks, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        elif request.method == 'POST':
            # Create new task
            serializer = WorkOrderTaskSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            task = serializer.save(work_order=work_order)
            
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)