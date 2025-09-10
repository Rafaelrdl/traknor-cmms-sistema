from rest_framework import renderers
import json


class CustomJSONRenderer(renderers.JSONRenderer):
    """Custom JSON renderer that wraps all responses in success/data format"""
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        """
        Wrap the response data in the mock server format:
        { "success": true, "data": ... }
        """
        
        # Get the response from the renderer context
        response = renderer_context.get('response') if renderer_context else None
        
        if response and hasattr(response, 'status_code'):
            # If it's already wrapped (from exception handler), don't wrap again
            if isinstance(data, dict) and 'success' in data:
                return super().render(data, accepted_media_type, renderer_context)
            
            # Handle different status codes
            if response.status_code >= 400:
                # Error response
                wrapped_data = {
                    'success': False,
                    'error': {
                        'message': str(data) if not isinstance(data, dict) else data.get('detail', 'An error occurred'),
                        'code': 'ERROR',
                        'details': data if isinstance(data, dict) else {}
                    }
                }
            else:
                # Success response
                wrapped_data = {
                    'success': True,
                    'data': data
                }
        else:
            # Default to success format
            wrapped_data = {
                'success': True,
                'data': data
            }
        
        return super().render(wrapped_data, accepted_media_type, renderer_context)