from rest_framework import serializers
from .models import (
    WorkOrder, 
    WorkOrderTask, 
    WorkOrderComment, 
    WorkOrderAttachment,
    WorkOrderStockItem
)
from apps.accounts.serializers import UserSerializer
from apps.equipment.serializers import EquipmentSummarySerializer


class WorkOrderTaskSerializer(serializers.ModelSerializer):
    """Task serializer"""
    
    class Meta:
        model = WorkOrderTask
        fields = [
            'id', 'name', 'description', 'checklist', 'completed', 
            'notes', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkOrderCommentSerializer(serializers.ModelSerializer):
    """Comment serializer"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkOrderComment
        fields = ['id', 'user', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class WorkOrderAttachmentSerializer(serializers.ModelSerializer):
    """Attachment serializer"""
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkOrderAttachment
        fields = [
            'id', 'file', 'filename', 'file_size', 
            'uploaded_by', 'created_at'
        ]
        read_only_fields = ['id', 'file_size', 'created_at']


class WorkOrderStockItemSerializer(serializers.ModelSerializer):
    """Stock item serializer"""
    
    class Meta:
        model = WorkOrderStockItem
        fields = [
            'id', 'stock_item_id', 'stock_item_name', 
            'quantity', 'unit', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class WorkOrderSerializer(serializers.ModelSerializer):
    """Complete work order serializer that matches frontend expectations"""
    
    # Related objects - readable
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True)
    assignee = UserSerializer(source='assigned_to', read_only=True)  # Match mock server
    requested_by_name = serializers.CharField(source='requested_by.name', read_only=True)
    requester = UserSerializer(source='requested_by', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    
    # Nested objects
    equipment = EquipmentSummarySerializer(many=True, read_only=True)
    tasks = WorkOrderTaskSerializer(many=True, read_only=True)
    comments = WorkOrderCommentSerializer(many=True, read_only=True)
    attachments = WorkOrderAttachmentSerializer(many=True, read_only=True)
    stock_items = WorkOrderStockItemSerializer(many=True, read_only=True)
    
    # Alternative field names for compatibility
    equipment_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = WorkOrder
        fields = [
            'id', 'code', 'title', 'description', 'type', 'status', 'priority',
            'assigned_to', 'assigned_to_name', 'assignee', 
            'requested_by', 'requested_by_name', 'requester',
            'company', 'company_name', 'sector', 'sector_name',
            'scheduled_date', 'started_at', 'completed_at',
            'notes', 'completion_notes', 'maintenance_plan',
            'equipment', 'equipment_ids', 'tasks', 'comments', 
            'attachments', 'stock_items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        equipment_ids = validated_data.pop('equipment_ids', [])
        work_order = WorkOrder.objects.create(**validated_data)
        
        # Add equipment if provided
        if equipment_ids:
            from apps.equipment.models import Equipment
            equipment_objects = Equipment.objects.filter(id__in=equipment_ids)
            work_order.equipment.set(equipment_objects)
        
        return work_order
    
    def update(self, instance, validated_data):
        equipment_ids = validated_data.pop('equipment_ids', None)
        
        # Update the work order
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update equipment if provided
        if equipment_ids is not None:
            from apps.equipment.models import Equipment
            equipment_objects = Equipment.objects.filter(id__in=equipment_ids)
            instance.equipment.set(equipment_objects)
        
        return instance


class WorkOrderCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating work orders"""
    equipment_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )
    tasks = WorkOrderTaskSerializer(many=True, required=False)
    
    class Meta:
        model = WorkOrder
        fields = [
            'title', 'description', 'type', 'status', 'priority',
            'assigned_to', 'requested_by', 'company', 'sector',
            'scheduled_date', 'notes', 'maintenance_plan',
            'equipment_ids', 'tasks'
        ]
    
    def create(self, validated_data):
        equipment_ids = validated_data.pop('equipment_ids', [])
        tasks_data = validated_data.pop('tasks', [])
        
        work_order = WorkOrder.objects.create(**validated_data)
        
        # Add equipment
        if equipment_ids:
            from apps.equipment.models import Equipment
            equipment_objects = Equipment.objects.filter(id__in=equipment_ids)
            work_order.equipment.set(equipment_objects)
        
        # Add tasks
        for i, task_data in enumerate(tasks_data):
            WorkOrderTask.objects.create(
                work_order=work_order,
                order=i,
                **task_data
            )
        
        return work_order


class WorkOrderSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for work orders in lists"""
    
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True)
    equipment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkOrder
        fields = [
            'id', 'code', 'title', 'type', 'status', 'priority',
            'assigned_to_name', 'scheduled_date', 'equipment_count',
            'created_at'
        ]
    
    def get_equipment_count(self, obj):
        return obj.equipment.count()