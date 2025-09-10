from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """Custom user model that matches the frontend expectations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=[
        ('ADMIN', 'Administrador'),
        ('TECHNICIAN', 'Técnico'),
        ('OPERATOR', 'Operador'),
        ('REQUESTER', 'Solicitante'),
    ])
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=[
        ('active', 'Ativo'),
        ('inactive', 'Inativo'),
    ], default='active')
    avatar_url = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    
    # Preferences stored as JSON
    preferences = models.JSONField(default=dict, blank=True)
    security = models.JSONField(default=dict, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'username']
    
    def __str__(self):
        return f"{self.name} ({self.email})"
    
    def save(self, *args, **kwargs):
        # Set username to email if not provided
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)