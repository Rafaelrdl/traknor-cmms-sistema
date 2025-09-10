// Import API hooks instead of mock data
import { 
  useCompanies as useApiCompanies,
  useUsers as useApiUsers,
  useEquipment as useApiEquipment,
  useWorkOrders as useApiWorkOrders,
  useMaintenancePlans as useApiMaintenancePlans,
  useSectors,
  useSubSections,
  useStock
} from './useApiData';

import type { 
  User, 
  Company, 
  Equipment, 
  WorkOrder, 
  DashboardKPIs 
} from '@/types';

import { 
  MOCK_DASHBOARD_KPIS,
  MOCK_CHART_DATA
} from '@/data/mockData';

// Re-export API hooks with the same interface for compatibility
export const useCompanies = useApiCompanies;
export const useUsers = useApiUsers;  
export const useEquipment = useApiEquipment;
export const useWorkOrders = useApiWorkOrders;
export const useMaintenancePlans = useApiMaintenancePlans;

// These still use mock data until API endpoints are available
export { useSectors, useSubSections, useStock };

export const useDashboardKPIs = (): [DashboardKPIs, () => void, boolean] => {
  return [MOCK_DASHBOARD_KPIS, () => {}, false];
};

export const useUser = (): [User, () => void, boolean] => {
  const userData: User = {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@traknor.com',
    role: 'ADMIN',
    department: 'TI'
  };
  return [userData, () => {}, false];
};

export const useChartData = (): [typeof MOCK_CHART_DATA, () => void, boolean] => {
  return [MOCK_CHART_DATA, () => {}, false];
};

// Individual item getters - for now using API data where available
export const getCompanyById = async (_id: string): Promise<Company | undefined> => {
  // This would use API in real implementation
  return undefined;
};

export const getSectorById = (_id: string) => {
  // This would use API in real implementation  
  return undefined;
};

export const getEquipmentById = async (_id: string): Promise<Equipment | undefined> => {
  // This would use API in real implementation
  return undefined;
};

export const getWorkOrderById = async (_id: string): Promise<WorkOrder | undefined> => {
  // This would use API in real implementation
  return undefined;
};

// Individual item getters - for now using API data where available
export const getCompanyById = async (id: string): Promise<Company | undefined> => {
  // This would use API in real implementation
  return undefined;
};

export const getSectorById = (id: string) => {
  // This would use API in real implementation  
  return undefined;
};

export const getEquipmentById = async (id: string): Promise<Equipment | undefined> => {
  // This would use API in real implementation
  return undefined;
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | undefined> => {
  // This would use API in real implementation
  return undefined;
};

export const useDashboardKPIs = (): [DashboardKPIs, () => void] => {
  return [MOCK_DASHBOARD_KPIS, () => {}];
};

export const useUser = (): [User, () => void] => {
  const userData: User = {
    id: '1',
    name: 'Admin',
    email: 'admin@climatrak.com',
    role: 'ADMIN',
    avatar: '/assets/avatar.png'
  };
  return [userData, () => {}];
};

// Hook para dados de gráficos centralizados
export const useChartData = (): [typeof MOCK_CHART_DATA, () => void] => {
  return [MOCK_CHART_DATA, () => {}];
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