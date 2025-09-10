from rest_framework import serializers
from .models import Company, Sector, SubSection


class SubSectionSerializer(serializers.ModelSerializer):
    """SubSection serializer"""
    
    class Meta:
        model = SubSection
        fields = [
            'id', 'name', 'sector', 'responsible', 'phone', 'email',
            'area', 'occupants', 'hvac_units', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SectorSerializer(serializers.ModelSerializer):
    """Sector serializer with nested subsections"""
    subsections = SubSectionSerializer(many=True, read_only=True)
    company_id = serializers.UUIDField(source='company.id', read_only=True)
    
    class Meta:
        model = Sector
        fields = [
            'id', 'name', 'company', 'company_id', 'responsible', 'phone', 'email',
            'area', 'occupants', 'hvac_units', 'notes', 
            'subsections', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanySerializer(serializers.ModelSerializer):
    """Company serializer that matches frontend expectations"""
    sectors = SectorSerializer(many=True, read_only=True)
    
    # Address as nested object to match frontend
    address = serializers.SerializerMethodField()
    
    # Map fields to match frontend naming
    total_area = serializers.IntegerField(source='total_area')
    hvac_units = serializers.IntegerField(source='hvac_units')
    role = serializers.CharField(source='responsible_role')
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'segment', 'cnpj', 'address', 'responsible', 'role',
            'phone', 'email', 'total_area', 'occupants', 'hvac_units', 
            'notes', 'status', 'sectors', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_address(self, obj):
        """Return address as nested object"""
        return {
            'zip': obj.address_zip,
            'city': obj.address_city,
            'state': obj.address_state,
            'fullAddress': obj.address_full
        }
    
    def create(self, validated_data):
        # Handle nested address data
        if 'address' in self.initial_data:
            address_data = self.initial_data['address']
            validated_data['address_zip'] = address_data.get('zip', '')
            validated_data['address_city'] = address_data.get('city', '')
            validated_data['address_state'] = address_data.get('state', '')
            validated_data['address_full'] = address_data.get('fullAddress', '')
        
        # Handle role mapping
        if 'role' in self.initial_data:
            validated_data['responsible_role'] = self.initial_data['role']
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Handle nested address data
        if 'address' in self.initial_data:
            address_data = self.initial_data['address']
            instance.address_zip = address_data.get('zip', instance.address_zip)
            instance.address_city = address_data.get('city', instance.address_city)
            instance.address_state = address_data.get('state', instance.address_state)
            instance.address_full = address_data.get('fullAddress', instance.address_full)
        
        # Handle role mapping
        if 'role' in self.initial_data:
            instance.responsible_role = self.initial_data['role']
        
        return super().update(instance, validated_data)


class CompanyCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating companies"""
    address = serializers.DictField(required=False)
    role = serializers.CharField(source='responsible_role', required=False)
    
    class Meta:
        model = Company
        fields = [
            'name', 'segment', 'cnpj', 'address', 'responsible', 'role',
            'phone', 'email', 'total_area', 'occupants', 'hvac_units', 'notes'
        ]