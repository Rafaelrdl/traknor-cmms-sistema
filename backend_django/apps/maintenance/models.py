from django.db import models
from apps.core.models import TimestampedModel


class MaintenancePlan(TimestampedModel):
    """Maintenance plan model"""
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    frequency = models.CharField(max_length=20, choices=[
        ('WEEKLY', 'Semanal'),
        ('MONTHLY', 'Mensal'),
        ('QUARTERLY', 'Trimestral'),
        ('SEMI_ANNUAL', 'Semestral'),
        ('ANNUAL', 'Anual'),
    ])
    
    is_active = models.BooleanField(default=True)
    
    # Relations
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='maintenance_plans'
    )
    equipment = models.ManyToManyField(
        'equipment.Equipment',
        related_name='maintenance_plans',
        blank=True
    )
    
    # Dates
    start_date = models.DateField(null=True, blank=True)
    next_execution = models.DateField(null=True, blank=True)
    last_execution = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_frequency_display()})"
    
    def calculate_next_execution(self):
        """Calculate next execution date based on frequency"""
        if not self.last_execution:
            return self.start_date
        
        from datetime import timedelta
        
        if self.frequency == 'WEEKLY':
            return self.last_execution + timedelta(days=7)
        elif self.frequency == 'MONTHLY':
            return self.last_execution + timedelta(days=30)
        elif self.frequency == 'QUARTERLY':
            return self.last_execution + timedelta(days=90)
        elif self.frequency == 'SEMI_ANNUAL':
            return self.last_execution + timedelta(days=180)
        elif self.frequency == 'ANNUAL':
            return self.last_execution + timedelta(days=365)
        
        return None


class MaintenancePlanTask(TimestampedModel):
    """Tasks within a maintenance plan"""
    
    plan = models.ForeignKey(
        MaintenancePlan,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    checklist = models.JSONField(default=list, blank=True)  # Array of strings
    
    # Order for task sequence
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.plan.name} - {self.name}"


class MaintenanceExecution(TimestampedModel):
    """Records of plan executions that generated work orders"""
    
    plan = models.ForeignKey(
        MaintenancePlan,
        on_delete=models.CASCADE,
        related_name='executions'
    )
    execution_date = models.DateField()
    executed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Link to generated work orders
    work_orders_count = models.PositiveIntegerField(default=0)
    
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.plan.name} - {self.execution_date}"