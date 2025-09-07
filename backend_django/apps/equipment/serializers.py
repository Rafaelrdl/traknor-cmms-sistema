from rest_framework import serializers
from .models import Equipment
from apps.companies.serializers import CompanySerializer, SectorSerializer, SubSectionSerializer


class EquipmentSerializer(serializers.ModelSerializer):
    """Equipment serializer that matches frontend expectations"""
    
    # Related objects
    company_name = serializers.CharField(source='company.name', read_only=True)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    subsection_name = serializers.CharField(source='subsection.name', read_only=True)
    
    # Alternative field names to match frontend
    sector_id = serializers.UUIDField(source='sector.id', read_only=True)
    subsection_id = serializers.UUIDField(source='subsection.id', read_only=True)
    
    # Date fields formatted as strings
    install_date = serializers.DateField(format='%Y-%m-%d')
    next_maintenance = serializers.DateField(format='%Y-%m-%d')
    last_maintenance = serializers.DateField(format='%Y-%m-%d')
    warranty_expiry = serializers.DateField(format='%Y-%m-%d')
    
    class Meta:
        model = Equipment
        fields = [
            'id', 'code', 'tag', 'name', 'type', 'manufacturer', 'brand', 
            'model', 'serial_number', 'capacity', 'specifications',
            'location', 'company', 'company_name', 'sector', 'sector_id', 
            'sector_name', 'subsection', 'subsection_id', 'subsection_name',
            'status', 'criticality', 'install_date', 'next_maintenance',
            'last_maintenance', 'warranty_expiry', 'total_operating_hours',
            'energy_consumption', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_code(self, value):
        """Ensure equipment code is unique"""
        if self.instance:
            # Update case - exclude current instance
            if Equipment.objects.exclude(id=self.instance.id).filter(code=value).exists():
                raise serializers.ValidationError("Equipment with this code already exists.")
        else:
            # Create case
            if Equipment.objects.filter(code=value).exists():
                raise serializers.ValidationError("Equipment with this code already exists.")
        return value


class EquipmentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating equipment"""
    
    class Meta:
        model = Equipment
        fields = [
            'name', 'type', 'manufacturer', 'brand', 'model', 'serial_number',
            'capacity', 'specifications', 'location', 'company', 'sector',
            'subsection', 'status', 'criticality', 'install_date',
            'next_maintenance', 'warranty_expiry', 'total_operating_hours',
            'energy_consumption', 'notes'
        ]


class EquipmentSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for equipment in lists"""
    
    class Meta:
        model = Equipment
        fields = ['id', 'code', 'name', 'type', 'status', 'location']