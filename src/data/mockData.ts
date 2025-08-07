import type { 
  Company, 
  Sector, 
  SubSection,
  Equipment, 
  WorkOrder, 
  MaintenancePlan, 
  StockItem,
  DashboardKPIs,
  TechnicianPerformance
} from '@/types';

/**
 * Arquivo centralizado com todos os dados fictícios da aplicação
 * Para facilitar a manutenção e alteração dos dados de exemplo
 */

// ============= EMPRESAS =============
export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
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
    totalArea: 5000,
    occupants: 150,
    hvacUnits: 12,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Industrial Corp',
    segment: 'Manufatura',
    cnpj: '98.765.432/0001-10',
    address: {
      zip: '04567-000',
      city: 'São Paulo',
      state: 'SP',
      fullAddress: 'Rua Industrial, 500'
    },
    responsible: 'João Silva',
    role: 'Gerente de Planta',
    phone: '(11) 91234-5678',
    email: 'joao@industrial.com',
    totalArea: 10000,
    occupants: 300,
    hvacUnits: 25,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
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
  }
];

// ============= SETORES =============
export const MOCK_SECTORS: Sector[] = [
  {
    id: '1',
    name: 'Setor Administrativo',
    companyId: '1',
    responsible: 'Ana Costa',
    phone: '(11) 91111-1111',
    email: 'ana@techcorp.com',
    area: 1500,
    occupants: 50,
    hvacUnits: 4
  },
  {
    id: '2',
    name: 'Departamento de TI',
    companyId: '1',
    responsible: 'Carlos Lima',
    phone: '(11) 92222-2222',
    email: 'carlos@techcorp.com',
    area: 800,
    occupants: 30,
    hvacUnits: 3
  },
  {
    id: '3',
    name: 'Chão de Fábrica',
    companyId: '2',
    responsible: 'Roberto Oliveira',
    phone: '(11) 93333-3333',
    email: 'roberto@industrial.com',
    area: 6000,
    occupants: 200,
    hvacUnits: 15
  },
  {
    id: '4',
    name: 'Praça de Alimentação',
    companyId: '3',
    responsible: 'Fernanda Costa',
    phone: '(11) 94444-4444',
    email: 'fernanda@shopping.com',
    area: 2000,
    occupants: 100,
    hvacUnits: 8
  },
  {
    id: '5',
    name: 'Lojas Piso Térreo',
    companyId: '3',
    responsible: 'Ricardo Mendes',
    phone: '(11) 95555-5555',
    email: 'ricardo@shopping.com',
    area: 5000,
    occupants: 200,
    hvacUnits: 15
  }
];

// ============= SUBSEÇÕES =============
export const MOCK_SUBSECTIONS: SubSection[] = [
  {
    id: '1',
    name: 'Recepção',
    sectorId: '1',
    responsible: 'Lucia Ferreira',
    phone: '(11) 94444-4444',
    email: 'lucia@techcorp.com',
    area: 200,
    occupants: 5,
    hvacUnits: 1
  },
  {
    id: '2',
    name: 'Salas de Reunião',
    sectorId: '1',
    responsible: 'Pedro Santos',
    phone: '(11) 95555-5555',
    email: 'pedro@techcorp.com',
    area: 300,
    occupants: 20,
    hvacUnits: 2
  },
  {
    id: '3',
    name: 'Sala de Servidores',
    sectorId: '2',
    responsible: 'Ana Tech',
    phone: '(11) 96666-6666',
    email: 'ana.tech@techcorp.com',
    area: 100,
    occupants: 5,
    hvacUnits: 2
  },
  {
    id: '4',
    name: 'Linha de Montagem A',
    sectorId: '3',
    responsible: 'Mario Silva',
    phone: '(11) 97777-7777',
    email: 'mario@industrial.com',
    area: 2000,
    occupants: 75,
    hvacUnits: 6
  },
  {
    id: '5',
    name: 'Controle de Qualidade',
    sectorId: '3',
    responsible: 'Elena Rodriguez',
    phone: '(11) 98888-8888',
    email: 'elena@industrial.com',
    area: 500,
    occupants: 25,
    hvacUnits: 2
  }
];

// ============= EQUIPAMENTOS =============
export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: '1',
    tag: 'CLI-001',
    model: 'Carrier 30XA-1820',
    brand: 'Carrier',
    type: 'CENTRAL',
    capacity: 180000, // BTU/h
    sectorId: '1',
    installDate: '2022-03-15',
    nextMaintenance: '2024-04-15',
    status: 'FUNCTIONING'
  },
  {
    id: '2',
    tag: 'SPL-002',
    model: 'LG S4-Q12JA3WF',
    brand: 'LG',
    type: 'SPLIT',
    capacity: 12000, // BTU/h
    sectorId: '2',
    installDate: '2023-01-20',
    nextMaintenance: '2024-04-20',
    status: 'FUNCTIONING'
  },
  {
    id: '3',
    tag: 'CHI-003',
    model: 'York YK-500',
    brand: 'Johnson Controls',
    type: 'CHILLER',
    capacity: 500, // TR
    sectorId: '3',
    installDate: '2021-06-10',
    nextMaintenance: '2024-04-10',
    status: 'MAINTENANCE'
  }
];

// ============= ORDENS DE SERVIÇO =============
export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: '1',
    number: 'OS-2024-001',
    equipmentId: '1',
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    scheduledDate: '2024-01-25',
    assignedTo: 'José Silva',
    description: 'Manutenção Preventiva - Climatizador Central. Limpeza de filtros, verificação de pressão do sistema e teste de funcionamento geral'
  },
  {
    id: '2',
    number: 'OS-2024-002',
    equipmentId: '2',
    type: 'CORRECTIVE',
    priority: 'HIGH',
    status: 'OPEN',
    scheduledDate: '2024-01-23',
    assignedTo: 'Carlos Pereira',
    description: 'Reparo Urgente - Split Sala TI. Vazamento de refrigerante detectado na unidade evaporadora'
  },
  {
    id: '3',
    number: 'OS-2024-003',
    equipmentId: '3',
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    scheduledDate: '2024-01-15',
    assignedTo: 'Roberto Oliveira',
    description: 'Inspeção Anual - Chiller Industrial. Inspeção completa anual conforme PMOC, incluindo análise de óleo e testes de eficiência',
    completedAt: '2024-01-18'
  }
];

// ============= PLANOS DE MANUTENÇÃO =============
export const MOCK_MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: '1',
    name: 'Plano Mensal - Climatizadores',
    description: 'Manutenção preventiva mensal para climatizadores centrais',
    frequency: 'MONTHLY',
    isActive: true
  },
  {
    id: '2',
    name: 'Plano Trimestral - Splits',
    description: 'Manutenção preventiva trimestral para aparelhos split',
    frequency: 'QUARTERLY',
    isActive: true
  },
  {
    id: '3',
    name: 'Plano Semestral - Chillers',
    description: 'Manutenção preventiva semestral para chillers industriais',
    frequency: 'SEMI_ANNUAL',
    isActive: true
  }
];

// ============= ESTOQUE =============
export const MOCK_STOCK_ITEMS: StockItem[] = [
  {
    id: '1',
    code: 'FLT-G4-610',
    description: 'Filtro de Ar G4 - 610x610x48mm',
    unit: 'unidade',
    quantity: 25,
    minimum: 10,
    maximum: 50
  },
  {
    id: '2',
    code: 'REF-R410A',
    description: 'Gás Refrigerante R-410A - Cilindro 13.6kg',
    unit: 'cilindro',
    quantity: 8,
    minimum: 5,
    maximum: 20
  },
  {
    id: '3',
    code: 'OIL-POE68',
    description: 'Óleo Lubrificante POE 68 - Galão 5L',
    unit: 'galão',
    quantity: 12,
    minimum: 6,
    maximum: 24
  },
  {
    id: '4',
    code: 'BLT-A43',
    description: 'Correia V - A43',
    unit: 'unidade',
    quantity: 15,
    minimum: 8,
    maximum: 30
  }
];

// ============= KPIS DO DASHBOARD =============
export const MOCK_DASHBOARD_KPIS: DashboardKPIs = {
  openWorkOrders: 32,
  overdueWorkOrders: 2,
  criticalEquipment: 3,
  mttr: 2.5, // horas
  mtbf: 168 // horas
};

// ============= DADOS PARA GRÁFICOS E VISUALIZAÇÕES =============
export const MOCK_CHART_DATA = {
  // Dados para o gráfico de evolução de OS por dia
  workOrderEvolution: [
    { day: 'Seg', completed: 5, inProgress: 3, open: 2 },
    { day: 'Ter', completed: 4, inProgress: 2, open: 3 },
    { day: 'Qua', completed: 6, inProgress: 3, open: 2 },
    { day: 'Qui', completed: 7, inProgress: 2, open: 1 },
    { day: 'Sex', completed: 8, inProgress: 2, open: 1 },
    { day: 'Sáb', completed: 2, inProgress: 1, open: 3 },
    { day: 'Dom', completed: 1, inProgress: 2, open: 2 }
  ],
  
  // Dados para o status dos ativos (donut chart)
  equipmentStatus: {
    functioning: 38,
    maintenance: 5, 
    stopped: 2
  },
  
  // Próximas manutenções (tabela)
  upcomingMaintenance: [
    {
      id: '1',
      equipmentName: 'Climatizador Central CLI-001',
      type: 'Manutenção Preventiva',
      scheduledDate: '2024-08-05',
      responsible: 'José Silva',
      priority: 'MEDIUM' as const
    },
    {
      id: '2', 
      equipmentName: 'Split Sala TI SPL-002',
      type: 'Inspeção Trimestral',
      scheduledDate: '2024-08-07',
      responsible: 'Carlos Pereira',
      priority: 'HIGH' as const
    },
    {
      id: '3',
      equipmentName: 'Chiller Industrial CHI-003', 
      type: 'Análise de Óleo',
      scheduledDate: '2024-08-10',
      responsible: 'Roberto Oliveira',
      priority: 'MEDIUM' as const
    }
  ],

  // Dados para gráfico de distribuição de OS por tipo
  workOrdersByType: {
    preventive: 18,
    corrective: 7,
    emergency: 2
  },

  // Dados para gráfico de eficiência energética
  energyEfficiency: [
    { month: 'Jan', efficiency: 85 },
    { month: 'Fev', efficiency: 87 },
    { month: 'Mar', efficiency: 89 },
    { month: 'Abr', efficiency: 88 },
    { month: 'Mai', efficiency: 90 },
    { month: 'Jun', efficiency: 92 }
  ],

  // Dados para gráfico de desempenho por técnico
  technicianPerformance: [
    { name: 'José Silva', preventive: 12, corrective: 3, request: 2 },
    { name: 'Carlos Pereira', preventive: 15, corrective: 2, request: 4 },
    { name: 'Roberto Oliveira', preventive: 8, corrective: 5, request: 1 },
    { name: 'Ana Costa', preventive: 10, corrective: 4, request: 3 },
    { name: 'Maria Santos', preventive: 13, corrective: 1, request: 2 }
  ] as TechnicianPerformance[]
};

// ============= FUNÇÕES GERADORAS (para compatibilidade) =============
export const generateMockCompanies = (): Company[] => MOCK_COMPANIES;
export const generateMockSectors = (): Sector[] => MOCK_SECTORS;
export const generateMockSubSections = (): SubSection[] => MOCK_SUBSECTIONS;
export const generateMockEquipment = (): Equipment[] => MOCK_EQUIPMENT;
export const generateMockWorkOrders = (): WorkOrder[] => MOCK_WORK_ORDERS;
export const generateMockPlans = (): MaintenancePlan[] => MOCK_MAINTENANCE_PLANS;
export const generateMockStock = (): StockItem[] => MOCK_STOCK_ITEMS;
export const generateMockDashboardKPIs = (): DashboardKPIs => MOCK_DASHBOARD_KPIS;
