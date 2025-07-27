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
import { 
  MOCK_COMPANIES,
  MOCK_SECTORS,
  MOCK_SUBSECTIONS,
  MOCK_EQUIPMENT,
  MOCK_WORK_ORDERS,
  MOCK_MAINTENANCE_PLANS,
  MOCK_STOCK_ITEMS,
  MOCK_DASHBOARD_KPIS
} from '@/data/mockData';

// Hook personalizado para empresas
export const useCompanies = () => {
  return {
    data: MOCK_COMPANIES,
    isLoading: false,
    error: null
  };
};

// Hook personalizado para setores
export const useSectors = () => {
  return {
    data: MOCK_SECTORS,
    isLoading: false,
    error: null
  };
};

// Hook personalizado para subseções
export const useSubSections = () => {
  return {
    data: MOCK_SUBSECTIONS,
    isLoading: false,
    error: null
  };
};

// Hook personalizado para equipamentos
export const useEquipment = () => {
  return {
    data: MOCK_EQUIPMENT,
    isLoading: false,
    error: null
  };
};

// Hook personalizado para ordens de serviço
export const useWorkOrders = () => {
  return {
    data: MOCK_WORK_ORDERS,
    isLoading: false,
    error: null
  };
};

// Hook personalizado para planos de manutenção
export const useMaintenancePlans = () => {
  return {
    data: MOCK_MAINTENANCE_PLANS,
    isLoading: false,
    error: null
  };
};

// Hook personalizado para estoque
export const useStock = () => {
  return {
    data: MOCK_STOCK_ITEMS,
    isLoading: false,
    error: null
  };
};

// Hook personalizado para KPIs do dashboard
export const useDashboardKPIs = () => {
  return {
    data: MOCK_DASHBOARD_KPIS,
    isLoading: false,
    error: null
  };
};

// Hook personalizado para usuário (adicionado para resolver erro de importação)
export const useUser = () => {
  return {
    data: {
      id: '1',
      name: 'Admin',
      email: 'admin@climatrak.com',
      role: 'ADMIN' as const,
      avatar: '/assets/avatar.png'
    },
    isLoading: false,
    error: null
  };
};

// Funções utilitárias para buscar dados específicos
export const findCompanyById = (id: string) => {
  return MOCK_COMPANIES.find(company => company.id === id);
};

export const findSectorById = (id: string) => {
  return MOCK_SECTORS.find(sector => sector.id === id);
};

export const findEquipmentById = (id: string) => {
  return MOCK_EQUIPMENT.find(equipment => equipment.id === id);
};

export const findWorkOrderById = (id: string) => {
  return MOCK_WORK_ORDERS.find(workOrder => workOrder.id === id);
};

// Hook utilitário para buscar qualquer item por ID
export const useFindById = <T extends { id: string }>(
  collection: T[],
  id: string | undefined
) => {
  if (!id) return null;
  return collection.find(item => item.id === id) || null;
};
