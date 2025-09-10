from django.db import models
from apps.core.models import TimestampedModel


class Equipment(TimestampedModel):
    """Equipment model that matches frontend expectations"""
    
    # Basic equipment info
    code = models.CharField(max_length=50, unique=True)  # "EQ-001"
    tag = models.CharField(max_length=50, unique=True, null=True, blank=True)  # Alternative identifier
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=[
        ('SPLIT', 'Split'),
        ('CENTRAL', 'Central'),
        ('VRF', 'VRF'),
        ('CHILLER', 'Chiller'),
    ])
    
    # Manufacturer info
    manufacturer = models.CharField(max_length=100, blank=True)
    brand = models.CharField(max_length=100, blank=True)  # Alternative field name
    model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, blank=True)
    
    # Capacity and specifications
    capacity = models.PositiveIntegerField(default=0)  # BTUs or similar
    specifications = models.JSONField(default=dict, blank=True)
    
    # Location
    location = models.CharField(max_length=255, blank=True)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='equipment'
    )
    sector = models.ForeignKey(
        'companies.Sector',
        on_delete=models.CASCADE,
        related_name='equipment',
        null=True,
        blank=True
    )
    subsection = models.ForeignKey(
        'companies.SubSection',
        on_delete=models.CASCADE,
        related_name='equipment',
        null=True,
        blank=True
    )
    
    # Status and condition
    status = models.CharField(max_length=20, choices=[
        ('FUNCTIONING', 'Funcionando'),
        ('MAINTENANCE', 'Em Manutenção'),
        ('STOPPED', 'Parado'),
        ('DECOMMISSIONED', 'Descomissionado'),
    ], default='FUNCTIONING')
    
    criticality = models.CharField(max_length=20, choices=[
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    ], default='medium')
    
    # Dates
    install_date = models.DateField(null=True, blank=True)
    next_maintenance = models.DateField(null=True, blank=True)
    last_maintenance = models.DateField(null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    
    # Operational data
    total_operating_hours = models.PositiveIntegerField(default=0)
    energy_consumption = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        help_text="kWh"
    )
    
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Equipment'
        verbose_name_plural = 'Equipment'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def save(self, *args, **kwargs):
        # Auto-generate code if not provided
        if not self.code:
            last_eq = Equipment.objects.filter(
                code__startswith='EQ-'
            ).order_by('code').last()
            
            if last_eq:
                try:
                    last_num = int(last_eq.code.split('-')[1])
                    self.code = f"EQ-{last_num + 1:03d}"
                except (ValueError, IndexError):
                    self.code = "EQ-001"
            else:
                self.code = "EQ-001"
        
        # Set brand from manufacturer if not provided
        if not self.brand and self.manufacturer:
            self.brand = self.manufacturer
        
        super().save(*args, **kwargs)