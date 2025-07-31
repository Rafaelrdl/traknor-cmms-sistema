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

// Hooks retornando arrays tipados com assinatura compatível
export const useCompanies = (): [Company[], (value: Company[] | ((current: Company[]) => Company[])) => void, () => void] => {
  return [MOCK_COMPANIES, () => {}, () => {}];
};

export const useSectors = (): [Sector[], (value: Sector[] | ((current: Sector[]) => Sector[])) => void, () => void] => {
  return [MOCK_SECTORS, () => {}, () => {}];
};

export const useSubSections = (): [SubSection[], (value: SubSection[] | ((current: SubSection[]) => SubSection[])) => void, () => void] => {
  return [MOCK_SUBSECTIONS, () => {}, () => {}];
};

export const useEquipment = (): [Equipment[], (value: Equipment[] | ((current: Equipment[]) => Equipment[])) => void, () => void] => {
  return [MOCK_EQUIPMENT, () => {}, () => {}];
};

export const useWorkOrders = (): [WorkOrder[], (value: WorkOrder[] | ((current: WorkOrder[]) => WorkOrder[])) => void, () => void] => {
  return [MOCK_WORK_ORDERS, () => {}, () => {}];
};

export const useMaintenancePlans = (): [MaintenancePlan[], (value: MaintenancePlan[] | ((current: MaintenancePlan[]) => MaintenancePlan[])) => void, () => void] => {
  return [MOCK_MAINTENANCE_PLANS, () => {}, () => {}];
};

export const useStock = (): [StockItem[], (value: StockItem[] | ((current: StockItem[]) => StockItem[])) => void, () => void] => {
  return [MOCK_STOCK_ITEMS, () => {}, () => {}];
};

export const useDashboardKPIs = (): [DashboardKPIs, (value: DashboardKPIs | ((current: DashboardKPIs) => DashboardKPIs)) => void, () => void] => {
  return [MOCK_DASHBOARD_KPIS, () => {}, () => {}];
};

export const useUser = (): [User, (value: User | ((current: User) => User)) => void, () => void] => {
  const userData: User = {
    id: '1',
    name: 'Admin',
    email: 'admin@traknor.com',
    role: 'ADMIN',
    avatar: '/assets/avatar.png'
  };
  return [userData, () => {}, () => {}];
};

// Hook para dados de gráficos centralizados
export const useChartData = (): [typeof MOCK_CHART_DATA, (value: typeof MOCK_CHART_DATA | ((current: typeof MOCK_CHART_DATA) => typeof MOCK_CHART_DATA)) => void, () => void] => {
  return [MOCK_CHART_DATA, () => {}, () => {}];
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