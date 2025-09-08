from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import connection
from rest_framework.decorators import api_view, permission_classes


class HealthCheckView(APIView):
    """Health check endpoint that matches the mock server format"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'success': True,
            'data': {
                'status': 'healthy',
                'timestamp': timezone.now().isoformat(),
                'message': 'TrakNor CMMS Django Backend is running'
            }
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def db_health(request):
    """Database health check endpoint"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT now(), current_database(), current_user")
            result = cursor.fetchone()
            db_time, db_name, db_user = result
            
        return Response({
            'success': True,
            'data': {
                'status': 'ok',
                'db_time': db_time.isoformat(),
                'database': db_name,
                'user': db_user,
                'message': 'PostgreSQL connection successful'
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': {
                'message': f'Database connection failed: {str(e)}',
                'status': 'error'
            }
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)