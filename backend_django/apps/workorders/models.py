from django.db import models
from apps.core.models import TimestampedModel


class WorkOrder(TimestampedModel):
    """Work Order model that matches frontend and mock server expectations"""
    
    code = models.CharField(max_length=50, unique=True)  # "OS001", "OS002"
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    type = models.CharField(max_length=20, choices=[
        ('PREVENTIVE', 'Preventiva'),
        ('CORRECTIVE', 'Corretiva'),
        ('INSPECTION', 'Inspeção'),
        ('TESTING', 'Teste'),
        ('CALIBRATION', 'Calibração'),
    ])
    
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pendente'),
        ('IN_PROGRESS', 'Em Andamento'),
        ('SCHEDULED', 'Agendada'),
        ('COMPLETED', 'Concluída'),
        ('CANCELLED', 'Cancelada'),
    ], default='PENDING')
    
    priority = models.CharField(max_length=20, choices=[
        ('LOW', 'Baixa'),
        ('MEDIUM', 'Média'),
        ('HIGH', 'Alta'),
        ('CRITICAL', 'Crítica'),
    ], default='MEDIUM')
    
    # Relations
    equipment = models.ManyToManyField(
        'equipment.Equipment',
        related_name='work_orders',
        blank=True
    )
    assigned_to = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_work_orders'
    )
    requested_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='requested_work_orders'
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='work_orders'
    )
    sector = models.ForeignKey(
        'companies.Sector',
        on_delete=models.CASCADE,
        related_name='work_orders',
        null=True,
        blank=True
    )
    
    # Dates
    scheduled_date = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Additional fields
    notes = models.TextField(blank=True)
    completion_notes = models.TextField(blank=True)
    
    # Plan reference if generated from maintenance plan
    maintenance_plan = models.ForeignKey(
        'maintenance.MaintenancePlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='work_orders'
    )
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.title}"
    
    def save(self, *args, **kwargs):
        # Auto-generate code if not provided
        if not self.code:
            last_wo = WorkOrder.objects.filter(
                code__startswith='OS'
            ).order_by('code').last()
            
            if last_wo:
                try:
                    last_num = int(last_wo.code[2:])  # Remove "OS" prefix
                    self.code = f"OS{last_num + 1:03d}"
                except (ValueError, IndexError):
                    self.code = "OS001"
            else:
                self.code = "OS001"
        
        super().save(*args, **kwargs)


class WorkOrderTask(TimestampedModel):
    """Tasks within a work order"""
    
    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    checklist = models.JSONField(default=list, blank=True)  # Array of strings
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    # Order for task sequence
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.work_order.code} - {self.name}"


class WorkOrderComment(TimestampedModel):
    """Comments on work orders"""
    
    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE
    )
    comment = models.TextField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment on {self.work_order.code} by {self.user.name}"


class WorkOrderAttachment(TimestampedModel):
    """File attachments for work orders"""
    
    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    file = models.FileField(upload_to='workorder_attachments/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE
    )
    
    def __str__(self):
        return f"{self.work_order.code} - {self.filename}"


class WorkOrderStockItem(TimestampedModel):
    """Stock items used in work orders"""
    
    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.CASCADE,
        related_name='stock_items'
    )
    stock_item_id = models.CharField(max_length=100)  # Reference to inventory system
    stock_item_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit = models.CharField(max_length=20, default='un')
    
    def __str__(self):
        return f"{self.work_order.code} - {self.stock_item_name} ({self.quantity})"