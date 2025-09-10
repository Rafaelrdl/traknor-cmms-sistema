from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """User serializer that matches frontend expectations"""
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'role', 'status', 'avatar_url', 
            'phone', 'created_at', 'updated_at', 'last_login_at',
            'preferences', 'security'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login_at']


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Email ou senha inválidos')
            
            if not user.is_active:
                raise serializers.ValidationError('Conta desativada')
            
            attrs['user'] = user
            return attrs
        
        raise serializers.ValidationError('Email e senha são obrigatórios')


class AuthResponseSerializer(serializers.Serializer):
    """Serializer for authentication response that matches mock format"""
    user = UserSerializer(read_only=True)
    tokens = serializers.DictField(read_only=True)


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'name', 'email', 'password', 'role', 'company', 
            'phone', 'preferences', 'security'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data['email'],
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user