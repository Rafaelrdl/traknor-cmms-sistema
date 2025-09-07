from rest_framework.response import Response


class BaseResponseSerializer:
    """Base serializer that wraps responses in the mock server format"""
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data  # The wrapping is done by the renderer