from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
import uuid
import threading

# Thread local storage for request ID
_request_local = threading.local()


def custom_exception_handler(exc, context):
    """Custom exception handler that returns consistent response format"""
    response = exception_handler(exc, context)
    
    if response is not None:
        if response.status_code >= 400:
            error_response = {
                'success': False,
                'error': {
                    'message': get_error_message(response.data),
                    'code': get_error_code(response.status_code),
                    'details': response.data if isinstance(response.data, dict) else {}
                }
            }
        else:
            error_response = {
                'success': True,
                'data': response.data
            }
        
        response.data = error_response
    
    return response


def get_error_message(data):
    """Extract a meaningful error message from response data"""
    if isinstance(data, dict):
        # Handle validation errors
        if 'detail' in data:
            return data['detail']
        
        # Handle field validation errors
        for field, errors in data.items():
            if isinstance(errors, list) and errors:
                return f"{field}: {errors[0]}"
        
        return "Erro de validação"
    
    elif isinstance(data, list) and data:
        return str(data[0])
    
    return str(data)


def get_error_code(status_code):
    """Get error code based on HTTP status"""
    error_codes = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        409: 'CONFLICT',
        422: 'VALIDATION_ERROR',
        500: 'INTERNAL_SERVER_ERROR',
    }
    return error_codes.get(status_code, 'UNKNOWN_ERROR')


def get_request_id():
    """Get current request ID from thread local storage"""
    return getattr(_request_local, 'request_id', None)


def set_request_id(request_id):
    """Set request ID in thread local storage"""
    _request_local.request_id = request_id