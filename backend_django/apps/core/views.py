from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils import timezone


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