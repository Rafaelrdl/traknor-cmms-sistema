import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Generate UUIDs for consistent references
  const adminId = randomUUID();
  const techId = randomUUID();
  const companyId = randomUUID();
  const sectorId = randomUUID();
  const equipmentId = randomUUID();
  const planId = randomUUID();

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@traknor.com' },
    update: {},
    create: {
      id: adminId,
      name: 'Administrador',
      email: 'admin@traknor.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '(11) 99999-9999',
      department: 'Administração',
      position: 'Administrador do Sistema',
      preferences: {
        theme: 'system',
        language: 'pt-BR',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        notifications: {
          email: true,
          push: true,
        },
      },
    },
  });

  // Create technician user
  const techPassword = await hashPassword('tecnico123');
  const technician = await prisma.user.upsert({
    where: { email: 'tecnico@traknor.com' },
    update: {},
    create: {
      id: techId,
      name: 'João Técnico',
      email: 'tecnico@traknor.com',
      password: techPassword,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      phone: '(11) 98888-8888',
      department: 'Manutenção',
      position: 'Técnico de Manutenção',
      preferences: {
        theme: 'system',
        language: 'pt-BR',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        notifications: {
          email: true,
          push: true,
        },
      },
    },
  });

  // Create sample company
  const company = await prisma.company.upsert({
    where: { id: companyId },
    update: {},
    create: {
      id: companyId,
      name: 'TechCorp Industrial',
      segment: 'Tecnologia',
      cnpj: '12.345.678/0001-90',
      address: {
        zip: '01310-100',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Paulista, 1000'
      },
      responsible: 'Maria Santos',
      role: 'Gerente de Facilities',
      phone: '(11) 98765-4321',
      email: 'maria@techcorp.com',
      total_area: 5000,
      occupants: 150,
      hvac_units: 12,
    },
  });

  // Create sample sector
  const sector = await prisma.sector.upsert({
    where: { id: sectorId },
    update: {},
    create: {
      id: sectorId,
      name: 'Escritório Principal',
      company_id: company.id,
      description: 'Área administrativa principal da empresa',
    },
  });

  // Create sample equipment
  const equipment = await prisma.equipment.upsert({
    where: { id: equipmentId },
    update: {},
    create: {
      id: equipmentId,
      code: 'EQ-001',
      name: 'Chiller Central 001',
      type: 'Chiller',
      manufacturer: 'Carrier',
      model: 'AquaForce 30XA',
      serial_number: 'CF2023001',
      company_id: company.id,
      sector_id: sector.id,
      location: 'Casa de Máquinas - Térreo',
      status: 'OPERATIONAL',
      criticality: 'HIGH',
      installation_date: new Date('2023-01-15'),
      warranty_expires: new Date('2025-01-15'),
      specifications: {
        capacity: '500 TR',
        power: '320 kW',
        voltage: '380V',
        refrigerant: 'R134a'
      },
    },
  });

  // Create sample maintenance plan
  const plan = await prisma.maintenancePlan.upsert({
    where: { id: planId },
    update: {},
    create: {
      id: planId,
      name: 'Manutenção Preventiva Chiller - Mensal',
      description: 'Manutenção preventiva mensal do sistema de refrigeração',
      frequency: 'MONTHLY',
      company_id: company.id,
      sector_id: sector.id,
      tasks: [
        {
          id: randomUUID(),
          name: 'Verificar níveis de óleo',
          checklist: [
            'Verificar nível do óleo do compressor',
            'Verificar qualidade do óleo',
            'Verificar vazamentos'
          ]
        },
        {
          id: randomUUID(),
          name: 'Inspecionar filtros',
          checklist: [
            'Verificar filtro de água',
            'Limpar filtro de ar',
            'Substituir se necessário'
          ]
        }
      ],
      status: 'ACTIVE',
      auto_generate: true,
      next_execution_date: new Date('2024-02-01'),
      created_by: admin.id,
    },
  });

  // Link equipment to plan
  await prisma.planEquipment.upsert({
    where: {
      plan_id_equipment_id: {
        plan_id: plan.id,
        equipment_id: equipment.id,
      }
    },
    update: {},
    create: {
      plan_id: plan.id,
      equipment_id: equipment.id,
    },
  });

  // Create sample work order
  const workOrderId = randomUUID();
  const workOrder = await prisma.workOrder.upsert({
    where: { id: workOrderId },
    update: {},
    create: {
      id: workOrderId,
      code: 'OS-2024-001',
      title: 'Manutenção Preventiva Chiller 001',
      description: 'Manutenção preventiva mensal do chiller central',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      status: 'PENDING',
      company_id: company.id,
      sector_id: sector.id,
      plan_id: plan.id,
      assigned_to: technician.id,
      scheduled_date: new Date('2024-02-01'),
      estimated_hours: 4,
      tasks: [
        {
          id: randomUUID(),
          name: 'Verificar níveis de óleo',
          completed: false,
          checklist: [
            { id: randomUUID(), description: 'Verificar nível do óleo do compressor', completed: false },
            { id: randomUUID(), description: 'Verificar qualidade do óleo', completed: false },
            { id: randomUUID(), description: 'Verificar vazamentos', completed: false }
          ]
        },
        {
          id: randomUUID(),
          name: 'Inspecionar filtros',
          completed: false,
          checklist: [
            { id: randomUUID(), description: 'Verificar filtro de água', completed: false },
            { id: randomUUID(), description: 'Limpar filtro de ar', completed: false },
            { id: randomUUID(), description: 'Substituir se necessário', completed: false }
          ]
        }
      ],
      created_by: admin.id,
    },
  });

  // Link equipment to work order
  await prisma.workOrderEquipment.upsert({
    where: {
      work_order_id_equipment_id: {
        work_order_id: workOrder.id,
        equipment_id: equipment.id,
      }
    },
    update: {},
    create: {
      work_order_id: workOrder.id,
      equipment_id: equipment.id,
    },
  });

  // Create sample stock items
  const stockItem1Id = randomUUID();
  await prisma.stockItem.upsert({
    where: { id: stockItem1Id },
    update: {},
    create: {
      id: stockItem1Id,
      code: 'ST-001',
      name: 'Filtro de Ar Condicionado',
      description: 'Filtro plissado para sistema HVAC',
      category: 'Filtros',
      unit: 'un',
      current_stock: 25,
      minimum_stock: 5,
      maximum_stock: 50,
      unit_price: 45.90,
      location: 'Almoxarifado A1',
      supplier: 'Filtros Industriais Ltda',
    },
  });

  const stockItem2Id = randomUUID();
  await prisma.stockItem.upsert({
    where: { id: stockItem2Id },
    update: {},
    create: {
      id: stockItem2Id,
      code: 'ST-002',
      name: 'Óleo Lubrificante Sintético',
      description: 'Óleo sintético para compressores',
      category: 'Lubrificantes',
      unit: 'l',
      current_stock: 8,
      minimum_stock: 2,
      maximum_stock: 20,
      unit_price: 120.00,
      location: 'Almoxarifado A2',
      supplier: 'Lubrificantes Pro',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin user:', admin.email, '/ admin123');
  console.log('Technician user:', technician.email, '/ tecnico123');
  console.log('Company ID:', company.id);
  console.log('Sector ID:', sector.id);
  console.log('Equipment ID:', equipment.id);
  console.log('Technician ID:', technician.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });