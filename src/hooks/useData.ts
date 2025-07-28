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
import { 
  MOCK_COMPANIES,
  MOCK_SECTORS,
  MOCK_SUBSECTIONS,
  MOCK_EQUIPMENT,
  MOCK_WORK_ORDERS,
  MOCK_MAINTENANCE_PLANS,
  MOCK_STOCK_ITEMS,
  MOCK_DASHBOARD_KPIS,
  MOCK_CHART_DATA
} from '@/data/mockData';

// Hooks usando useKV para persistência de dados
export const useCompanies = () => {
  return useKV<Company[]>('companies', MOCK_COMPANIES);
};

export const useSectors = () => {
  return useKV<Sector[]>('sectors', MOCK_SECTORS);
};

export const useSubSections = () => {
  return useKV<SubSection[]>('subsections', MOCK_SUBSECTIONS);
};

export const useEquipment = () => {
  return useKV<Equipment[]>('equipment', MOCK_EQUIPMENT);
};

export const useWorkOrders = () => {
  return useKV<WorkOrder[]>('work-orders', MOCK_WORK_ORDERS);
};

export const useMaintenancePlans = () => {
  return useKV<MaintenancePlan[]>('maintenance-plans', MOCK_MAINTENANCE_PLANS);
};

export const useStock = () => {
  return useKV<StockItem[]>('stock-items', MOCK_STOCK_ITEMS);
};

export const useDashboardKPIs = () => {
  return useKV<DashboardKPIs>('dashboard-kpis', MOCK_DASHBOARD_KPIS);
};

export const useUser = () => {
  const userData: User = {
    id: '1',
    name: 'Admin',
    email: 'admin@climatrak.com',
    role: 'ADMIN',
    avatar: '/assets/avatar.png'
  };
  return useKV<User>('user', userData);
};

// Hook para dados de gráficos centralizados
export const useChartData = () => {
  return useKV<typeof MOCK_CHART_DATA>('chart-data', MOCK_CHART_DATA);
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
