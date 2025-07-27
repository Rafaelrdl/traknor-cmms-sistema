import { useKV } from '@github/spark/hooks';
import type { 
  User, 
  Company, 
  Sector, 
  SubSection,
  Equipment, 
  WorkOrder, 
  MaintenancePlan, 
  StockItem,
  DashboardKPIs 
} from '@/types';

// Mock data generators
const generateMockCompanies = (): Company[] => [
  {
    id: '1',
    name: 'Shopping Center Norte',
    segment: 'Varejo',
    cnpj: '12.345.678/0001-90',
    address: {
      zip: '04567-890',
      city: 'São Paulo',
      state: 'SP',
      fullAddress: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP'
    },
    responsible: 'Carlos Silva',
    role: 'Gerente Geral',
    phone: '(11) 99999-1111',
    email: 'carlos@shopping.com',
    totalArea: 15000,
    occupants: 500,
    hvacUnits: 45,
    notes: 'Shopping com praça de alimentação e 3 pavimentos',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Edifício Administrativo Sul',
    segment: 'Corporativo',
    cnpj: '98.765.432/0001-10',
    address: {
      zip: '04123-456',
      city: 'São Paulo',
      state: 'SP',
      fullAddress: 'R. Augusta, 500 - Consolação, São Paulo - SP'
    },
    responsible: 'Ana Santos',
    role: 'Administradora Predial',
    phone: '(11) 99999-2222',
    email: 'ana@edificio.com',
    totalArea: 8000,
    occupants: 200,
    hvacUnits: 25,
    notes: 'Edifício corporativo com 12 andares',
    createdAt: '2024-02-20'
  }
];

const generateMockSectors = (): Sector[] => [
  {
    id: '1',
    name: 'Praça de Alimentação',
    companyId: '1',
    responsible: 'Carlos Silva',
    phone: '(11) 99999-1111',
    email: 'carlos@shopping.com',
    area: 500,
    occupants: 100,
    hvacUnits: 8,
    notes: 'Área com 15 restaurantes'
  },
  {
    id: '2',
    name: 'Lojas Piso 1',
    companyId: '1', 
    responsible: 'Ana Santos',
    phone: '(11) 99999-2222',
    email: 'ana@shopping.com',
    area: 800,
    occupants: 50,
    hvacUnits: 12
  },
  {
    id: '3',
    name: 'Escritórios Corporativos',
    companyId: '2',
    responsible: 'João Oliveira',
    phone: '(11) 99999-3333', 
    email: 'joao@edificio.com',
    area: 300,
    occupants: 80,
    hvacUnits: 6
  },
  {
    id: '4',
    name: 'Área Comum',
    companyId: '2',
    responsible: 'Maria Ferreira',
    phone: '(11) 99999-4444',
    email: 'maria@edificio.com',
    area: 200,
    occupants: 30,
    hvacUnits: 4
  }
];

const generateMockSubSections = (): SubSection[] => [
  {
    id: '1',
    name: 'Área de Mesas',
    sectorId: '1',
    responsible: 'Pedro Costa',
    phone: '(11) 99999-5555',
    email: 'pedro@shopping.com',
    area: 200,
    occupants: 60,
    hvacUnits: 4,
    notes: 'Área central de alimentação'
  },
  {
    id: '2',
    name: 'Cozinhas',
    sectorId: '1',
    responsible: 'Lucia Santos',
    phone: '(11) 99999-6666',
    email: 'lucia@shopping.com',
    area: 300,
    occupants: 40,
    hvacUnits: 4,
    notes: 'Área de preparo dos restaurantes'
  },
  {
    id: '3',
    name: 'Loja A',
    sectorId: '2',
    responsible: 'Roberto Lima',
    phone: '(11) 99999-7777',
    email: 'roberto@lojaa.com',
    area: 150,
    occupants: 10,
    hvacUnits: 2
  },
  {
    id: '4',
    name: 'Loja B',
    sectorId: '2',
    responsible: 'Fernanda Rocha',
    phone: '(11) 99999-8888',
    email: 'fernanda@lojab.com',
    area: 200,
    occupants: 15,
    hvacUnits: 3
  }
];

const generateMockEquipment = (): Equipment[] => [
  {
    id: '1',
    tag: 'AC-PAF-01',
    model: 'Inverter 18000',
    brand: 'Midea',
    type: 'SPLIT',
    capacity: 18000,
    sectorId: '1',
    subSectionId: '1',
    installDate: '2023-03-15',
    nextMaintenance: '2025-01-15',
    status: 'FUNCTIONING'
  },
  {
    id: '2',
    tag: 'AC-L1-01',
    model: 'VRF 60000',
    brand: 'Daikin',
    type: 'VRF', 
    capacity: 60000,
    sectorId: '2',
    subSectionId: '3',
    installDate: '2023-05-20',
    nextMaintenance: '2025-01-10',
    status: 'MAINTENANCE'
  },
  {
    id: '3',
    tag: 'AC-ESC-01', 
    model: 'Cassete 36000',
    brand: 'LG',
    type: 'SPLIT',
    capacity: 36000,
    sectorId: '3',
    installDate: '2023-07-10',
    nextMaintenance: '2025-01-20',
    status: 'FUNCTIONING'
  }
];

const generateMockWorkOrders = (): WorkOrder[] => [
  {
    id: '1',
    number: 'OS-2025-001',
    equipmentId: '1',
    type: 'PREVENTIVE',
    status: 'OPEN',
    scheduledDate: '2025-01-15',
    assignedTo: 'João Técnico',
    priority: 'MEDIUM',
    description: 'Manutenção preventiva trimestral'
  },
  {
    id: '2',
    number: 'OS-2025-002',
    equipmentId: '2',
    type: 'CORRECTIVE',
    status: 'IN_PROGRESS',
    scheduledDate: '2025-01-10',
    assignedTo: 'Maria Técnica',
    priority: 'HIGH',
    description: 'Vazamento no evaporador'
  },
  {
    id: '3',
    number: 'OS-2025-003',
    equipmentId: '3',
    type: 'PREVENTIVE',
    status: 'COMPLETED',
    scheduledDate: '2025-01-05',
    assignedTo: 'Carlos Técnico',
    priority: 'LOW',
    description: 'Limpeza de filtros',
    completedAt: '2025-01-05'
  }
];

const generateMockPlans = (): MaintenancePlan[] => [
  {
    id: '1',
    name: 'Manutenção Preventiva Split',
    description: 'Limpeza e verificação de splits residenciais',
    frequency: 'QUARTERLY',
    isActive: true
  },
  {
    id: '2',
    name: 'Manutenção VRF',
    description: 'Manutenção completa em sistemas VRF',
    frequency: 'SEMI_ANNUAL',
    isActive: true
  }
];

const generateMockStock = (): StockItem[] => [
  {
    id: '1',
    code: 'FILT-001',
    description: 'Filtro de Ar Split 30x30cm',
    unit: 'UN',
    quantity: 25,
    minimum: 10,
    maximum: 50
  },
  {
    id: '2',
    code: 'GAS-R410',
    description: 'Gás Refrigerante R410A',
    unit: 'KG',
    quantity: 5,
    minimum: 3,
    maximum: 15
  },
  {
    id: '3',
    code: 'CONT-001',
    description: 'Contator 25A',
    unit: 'UN',
    quantity: 2,
    minimum: 5,
    maximum: 20
  }
];

// Custom hooks for data management
export const useCompanies = () => {
  return useKV('companies', generateMockCompanies());
};

export const useSectors = () => {
  return useKV('sectors', generateMockSectors());
};

export const useSubSections = () => {
  return useKV('subSections', generateMockSubSections());
};

export const useEquipment = () => {
  return useKV('equipment', generateMockEquipment());
};

export const useWorkOrders = () => {
  return useKV('workOrders', generateMockWorkOrders());
};

export const useMaintenancePlans = () => {
  return useKV('maintenancePlans', generateMockPlans());
};

export const useStock = () => {
  return useKV('stock', generateMockStock());
};

export const useUser = () => {
  return useKV('currentUser', {
    id: '1',
    name: 'João Silva',
    email: 'joao@traknor.com',
    role: 'MANAGER' as const,
    avatar: undefined
  });
};

export const useDashboardKPIs = (): DashboardKPIs => {
  const [workOrders] = useWorkOrders();
  const [equipment] = useEquipment();
  
  const openWorkOrders = workOrders.filter(wo => wo.status === 'OPEN').length;
  const overdueWorkOrders = workOrders.filter(wo => 
    wo.status !== 'COMPLETED' && new Date(wo.scheduledDate) < new Date()
  ).length;
  const criticalEquipment = equipment.filter(eq => eq.status === 'STOPPED').length;
  
  return {
    openWorkOrders,
    overdueWorkOrders,
    criticalEquipment,
    mttr: 14,
    mtbf: 21
  };
};