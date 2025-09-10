from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from .models import User
from .serializers import (
    LoginSerializer, 
    UserSerializer, 
    AuthResponseSerializer,
    UserCreateSerializer
)


class LoginView(generics.CreateAPIView):
    """Login endpoint that matches mock server format"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Update last login
            user.last_login_at = timezone.now()
            user.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            tokens = {
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            }
            
            # Response in mock server format
            response_data = {
                'success': True,
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': tokens
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        # Error response in mock server format
        error_message = 'Email ou senha inválidos'
        if serializer.errors:
            first_error = next(iter(serializer.errors.values()))
            if isinstance(first_error, list) and first_error:
                error_message = first_error[0]
        
        return Response({
            'success': False,
            'error': {
                'code': 'INVALID_CREDENTIALS',
                'message': error_message
            }
        }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(generics.CreateAPIView):
    """Logout endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'data': {'message': 'Logout realizado com sucesso'}
            })
        except Exception:
            return Response({
                'success': True,
                'data': {'message': 'Logout realizado com sucesso'}
            })  # Always return success for logout


class CurrentUserView(generics.RetrieveAPIView):
    """Current user endpoint (/api/auth/me)"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response({
            'success': True,
            'data': serializer.data
        })


class UserViewSet(viewsets.ModelViewSet):
    """Users CRUD endpoint (/api/users)"""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
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
        user = serializer.save()
        
        return Response({
            'success': True,
            'data': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
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
        instance = self.get_object()
        instance.delete()
        return Response({
            'success': True,
            'data': {'message': 'Usuário removido com sucesso'}
        })