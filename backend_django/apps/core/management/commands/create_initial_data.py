from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
import uuid

from apps.companies.models import Company, Sector
from apps.equipment.models import Equipment
from apps.workorders.models import WorkOrder

User = get_user_model()


class Command(BaseCommand):
    help = 'Create initial data for TrakNor CMMS - matching mock server data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Creating initial data for TrakNor CMMS...'))
        
        # Create company
        company, created = Company.objects.get_or_create(
            id="62ed183d-f7c2-479c-b385-ab8ca7c6d068",
            defaults={
                'name': "TrakNor Industrial",
                'segment': "Tecnologia",
                'cnpj': "12.345.678/0001-90",
                'address_zip': "01310-100",
                'address_city': "São Paulo",
                'address_state': "SP",
                'address_full': "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
                'responsible': "Maria Santos",
                'responsible_role': "Gerente de Facilities",
                'phone': "(11) 98765-4321",
                'email': "maria@traknor.com",
                'total_area': 5000,
                'occupants': 150,
                'hvac_units': 12,
                'status': 'active'
            }
        )
        if created:
            self.stdout.write(f'✅ Created company: {company.name}')
        else:
            self.stdout.write(f'ℹ️  Company already exists: {company.name}')
        
        # Create sector
        sector, created = Sector.objects.get_or_create(
            id="b73af9b2-c27a-4d33-b36e-3c70caee9780",
            defaults={
                'name': "Produção",
                'company': company,
                'responsible': "João Silva",
                'phone': "(11) 91234-5678",
                'email': "joao@traknor.com",
                'area': 2500,
                'occupants': 75,
                'hvac_units': 6
            }
        )
        if created:
            self.stdout.write(f'✅ Created sector: {sector.name}')
        
        # Create users with EXACT same credentials as mock server
        admin, created = User.objects.get_or_create(
            email="admin@traknor.com",
            defaults={
                'id': "4b0a9e5d-6f2c-43d8-a789-8f7c8eace9e0",
                'username': "admin",
                'name': "Admin TrakNor",
                'role': "ADMIN",
                'company': company,
                'status': 'active',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password("admin123")  # EXACT same password as mock
            admin.save()
            self.stdout.write('✅ Created admin user: admin@traknor.com / admin123')
        
        technician, created = User.objects.get_or_create(
            email="tecnico@traknor.com",
            defaults={
                'id': "89256d78-d078-43ca-bb87-3305f77b3972",
                'username': "tecnico",
                'name': "João Silva",
                'role': "TECHNICIAN",
                'company': company,
                'status': 'active'
            }
        )
        if created:
            technician.set_password("tecnico123")  # EXACT same password as mock
            technician.save()
            self.stdout.write('✅ Created technician user: tecnico@traknor.com / tecnico123')
        
        # Create equipment - matching mock server data
        equipment_data = [
            {
                'id': 'eq-001',
                'code': 'EQ-001',
                'name': 'HVAC Principal',
                'type': 'CENTRAL',
                'manufacturer': 'Atlas Copco',
                'model': 'GA-250',
                'location': 'Sala de Máquinas',
                'status': 'FUNCTIONING',
                'criticality': 'critical'
            },
            {
                'id': 'eq-002',
                'code': 'EQ-002',
                'name': 'Compressor Central',
                'type': 'CENTRAL',
                'manufacturer': 'Ingersoll Rand',
                'model': 'R-Series',
                'location': 'Área Industrial',
                'status': 'MAINTENANCE',
                'criticality': 'high'
            },
            {
                'id': 'eq-003',
                'code': 'EQ-003',
                'name': 'Painel Elétrico',
                'type': 'CENTRAL',
                'manufacturer': 'Schneider Electric',
                'model': 'PowerLogic',
                'location': 'Sala Elétrica',
                'status': 'FUNCTIONING',
                'criticality': 'medium'
            }
        ]
        
        for eq_data in equipment_data:
            eq_id = eq_data.pop('id')
            equipment, created = Equipment.objects.get_or_create(
                id=eq_id,
                defaults={
                    **eq_data,
                    'company': company,
                    'sector': sector,
                    'capacity': 25000,
                    'install_date': date(2023, 1, 15),
                    'next_maintenance': date.today() + timedelta(days=30)
                }
            )
            if created:
                self.stdout.write(f'✅ Created equipment: {equipment.name}')
        
        # Create work orders - matching mock server data EXACTLY
        work_orders_data = [
            {
                'id': 'wo-001',
                'code': 'OS001',
                'title': 'Manutenção Preventiva HVAC',
                'description': 'Limpeza e verificação do sistema HVAC principal',
                'type': 'PREVENTIVE',
                'status': 'PENDING',
                'priority': 'MEDIUM',
                'scheduled_date': '2024-01-25T09:00:00Z',
            },
            {
                'id': 'wo-002',
                'code': 'OS002',
                'title': 'Reparo Compressor',
                'description': 'Substituição de peças do compressor central',
                'type': 'CORRECTIVE',
                'status': 'IN_PROGRESS',
                'priority': 'HIGH',
                'scheduled_date': '2024-01-24T14:00:00Z',
            },
            {
                'id': 'wo-003',
                'code': 'OS003',
                'title': 'Inspeção Elétrica',
                'description': 'Verificação completa do sistema elétrico',
                'type': 'INSPECTION',
                'status': 'PENDING',
                'priority': 'LOW',
                'scheduled_date': '2024-01-26T11:00:00Z',
            },
            {
                'id': 'wo-004',
                'code': 'OS004',
                'title': 'Lubrificação Equipamentos',
                'description': 'Lubrificação de todos os equipamentos rotativos',
                'type': 'PREVENTIVE',
                'status': 'COMPLETED',
                'priority': 'MEDIUM',
                'scheduled_date': '2024-01-23T08:00:00Z',
            },
            {
                'id': 'wo-005',
                'code': 'OS005',
                'title': 'Calibração Sensores',
                'description': 'Calibração dos sensores de temperatura e pressão',
                'type': 'CALIBRATION',
                'status': 'PENDING',
                'priority': 'HIGH',
                'scheduled_date': '2024-01-27T10:00:00Z',
            },
            {
                'id': 'wo-006',
                'code': 'OS006',
                'title': 'Troca de Filtros',
                'description': 'Substituição de filtros do sistema de ar condicionado',
                'type': 'PREVENTIVE',
                'status': 'IN_PROGRESS',
                'priority': 'MEDIUM',
                'scheduled_date': '2024-01-25T16:00:00Z',
            },
            {
                'id': 'wo-007',
                'code': 'OS007',
                'title': 'Teste de Backup',
                'description': 'Teste do sistema de backup de energia',
                'type': 'TESTING',
                'status': 'SCHEDULED',
                'priority': 'LOW',
                'scheduled_date': '2024-01-28T13:00:00Z',
            }
        ]
        
        # Map assigned technicians as in mock server
        assigned_names = [
            'João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa',
            'Pedro Lima', 'Luciana Rodrigues', 'Roberto Ferreira'
        ]
        
        for i, wo_data in enumerate(work_orders_data):
            wo_id = wo_data.pop('id')
            wo_code = wo_data['code']
            
            # Assign to technician or admin alternately
            assigned_to = technician if i % 2 == 0 else admin
            
            work_order, created = WorkOrder.objects.get_or_create(
                id=wo_id,
                defaults={
                    **wo_data,
                    'assigned_to': assigned_to,
                    'requested_by': admin,  # Admin requested all orders
                    'company': company,
                    'sector': sector,
                    'scheduled_date': timezone.datetime.fromisoformat(
                        wo_data['scheduled_date'].replace('Z', '+00:00')
                    )
                }
            )
            
            if created:
                # Assign equipment to work order
                equipment_map = {
                    'OS001': Equipment.objects.get(code='EQ-001'),
                    'OS002': Equipment.objects.get(code='EQ-002'),
                    'OS003': Equipment.objects.get(code='EQ-003'),
                }
                
                if wo_code in equipment_map:
                    work_order.equipment.add(equipment_map[wo_code])
                
                self.stdout.write(f'✅ Created work order: {work_order.code} - {work_order.title}')
        
        self.stdout.write(
            self.style.SUCCESS(
                '\n🎉 Initial data created successfully!\n\n'
                '📋 Summary:\n'
                f'  • Company: {company.name}\n'
                f'  • Users: 2 (admin, technician)\n'
                f'  • Equipment: {Equipment.objects.count()}\n'
                f'  • Work Orders: {WorkOrder.objects.count()}\n\n'
                '🔐 Login credentials:\n'
                '  • Admin: admin@traknor.com / admin123\n'
                '  • Tech:  tecnico@traknor.com / tecnico123\n'
            )
        )