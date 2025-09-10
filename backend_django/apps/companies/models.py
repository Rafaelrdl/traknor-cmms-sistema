from django.db import models
from apps.core.models import TimestampedModel


class Company(TimestampedModel):
    """Company model that matches frontend expectations"""
    name = models.CharField(max_length=255)
    segment = models.CharField(max_length=100, default='Tecnologia')
    cnpj = models.CharField(max_length=18, unique=True)
    
    # Address fields
    address_zip = models.CharField(max_length=10, blank=True)
    address_city = models.CharField(max_length=100, blank=True)
    address_state = models.CharField(max_length=2, blank=True)
    address_full = models.TextField(blank=True)
    
    # Contact info
    responsible = models.CharField(max_length=255, blank=True)
    responsible_role = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Operational data
    total_area = models.PositiveIntegerField(default=0)
    occupants = models.PositiveIntegerField(default=0)
    hvac_units = models.PositiveIntegerField(default=0)
    
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[
        ('active', 'Ativo'),
        ('inactive', 'Inativo'),
    ], default='active')
    
    class Meta:
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
    
    def __str__(self):
        return self.name


class Sector(TimestampedModel):
    """Sector model that belongs to a company"""
    name = models.CharField(max_length=255)
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE, 
        related_name='sectors'
    )
    
    # Contact info
    responsible = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Operational data
    area = models.PositiveIntegerField(default=0)
    occupants = models.PositiveIntegerField(default=0)
    hvac_units = models.PositiveIntegerField(default=0)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['company', 'name']
    
    def __str__(self):
        return f"{self.company.name} - {self.name}"


class SubSection(TimestampedModel):
    """SubSection model that belongs to a sector"""
    name = models.CharField(max_length=255)
    sector = models.ForeignKey(
        Sector, 
        on_delete=models.CASCADE, 
        related_name='subsections'
    )
    
    # Contact info
    responsible = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Operational data
    area = models.PositiveIntegerField(default=0)
    occupants = models.PositiveIntegerField(default=0)
    hvac_units = models.PositiveIntegerField(default=0)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['sector', 'name']
    
    def __str__(self):
        return f"{self.sector} - {self.name}"