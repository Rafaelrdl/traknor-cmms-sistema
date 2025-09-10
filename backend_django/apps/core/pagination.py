from rest_framework import pagination
from rest_framework.response import Response


class CustomPageNumberPagination(pagination.PageNumberPagination):
    """Custom pagination that matches the mock server format"""
    
    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'data': data,
            'meta': {
                'total': self.page.paginator.count,
                'page': self.page.number,
                'per_page': self.page_size,
                'total_pages': self.page.paginator.num_pages,
            }
        })