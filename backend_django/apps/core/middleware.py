import uuid
from django.utils.deprecation import MiddlewareMixin
from .exceptions import set_request_id


class RequestIDMiddleware(MiddlewareMixin):
    """Middleware to add a unique request ID to each request"""
    
    def process_request(self, request):
        request_id = str(uuid.uuid4())
        request.request_id = request_id
        set_request_id(request_id)
        return None
    
    def process_response(self, request, response):
        # Add request ID to response headers
        if hasattr(request, 'request_id'):
            response['X-Request-ID'] = request.request_id
        return response