import { useState } from 'react';
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

// Temporary hooks using useState instead of useKV to fix loading issues
export const useCompanies = (): [Company[], (value: Company[] | ((current: Company[]) => Company[])) => void, () => void] => {
  const [data] = useState<Company[]>(MOCK_COMPANIES);
  const setData = (value: Company[] | ((current: Company[]) => Company[])) => {
    // For now, just log changes since we're not actually persisting
    console.log('Companies updated:', value);
  };
  const deleteData = () => {
    console.log('Companies deleted');
  };
  return [data, setData, deleteData];
};

export const useSectors = (): [Sector[], (value: Sector[] | ((current: Sector[]) => Sector[])) => void, () => void] => {
  const [data] = useState<Sector[]>(MOCK_SECTORS);
  const setData = (value: Sector[] | ((current: Sector[]) => Sector[])) => {
    console.log('Sectors updated:', value);
  };
  const deleteData = () => {
    console.log('Sectors deleted');
  };
  return [data, setData, deleteData];
};

export const useSubSections = (): [SubSection[], (value: SubSection[] | ((current: SubSection[]) => SubSection[])) => void, () => void] => {
  const [data] = useState<SubSection[]>(MOCK_SUBSECTIONS);
  const setData = (value: SubSection[] | ((current: SubSection[]) => SubSection[])) => {
    console.log('SubSections updated:', value);
  };
  const deleteData = () => {
    console.log('SubSections deleted');
  };
  return [data, setData, deleteData];
};

export const useEquipment = (): [Equipment[], (value: Equipment[] | ((current: Equipment[]) => Equipment[])) => void, () => void] => {
  const [data] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const setData = (value: Equipment[] | ((current: Equipment[]) => Equipment[])) => {
    console.log('Equipment updated:', value);
  };
  const deleteData = () => {
    console.log('Equipment deleted');
  };
  return [data, setData, deleteData];
};

export const useWorkOrders = (): [WorkOrder[], (value: WorkOrder[] | ((current: WorkOrder[]) => WorkOrder[])) => void, () => void] => {
  const [data] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const setData = (value: WorkOrder[] | ((current: WorkOrder[]) => WorkOrder[])) => {
    console.log('WorkOrders updated:', value);
  };
  const deleteData = () => {
    console.log('WorkOrders deleted');
  };
  return [data, setData, deleteData];
};

export const useMaintenancePlans = (): [MaintenancePlan[], (value: MaintenancePlan[] | ((current: MaintenancePlan[]) => MaintenancePlan[])) => void, () => void] => {
  const [data] = useState<MaintenancePlan[]>(MOCK_MAINTENANCE_PLANS);
  const setData = (value: MaintenancePlan[] | ((current: MaintenancePlan[]) => MaintenancePlan[])) => {
    console.log('MaintenancePlans updated:', value);
  };
  const deleteData = () => {
    console.log('MaintenancePlans deleted');
  };
  return [data, setData, deleteData];
};

export const useStock = (): [StockItem[], (value: StockItem[] | ((current: StockItem[]) => StockItem[])) => void, () => void] => {
  const [data] = useState<StockItem[]>(MOCK_STOCK_ITEMS);
  const setData = (value: StockItem[] | ((current: StockItem[]) => StockItem[])) => {
    console.log('Stock updated:', value);
  };
  const deleteData = () => {
    console.log('Stock deleted');
  };
  return [data, setData, deleteData];
};

export const useDashboardKPIs = (): [DashboardKPIs, (value: DashboardKPIs | ((current: DashboardKPIs) => DashboardKPIs)) => void, () => void] => {
  const [data] = useState<DashboardKPIs>(MOCK_DASHBOARD_KPIS);
  const setData = (value: DashboardKPIs | ((current: DashboardKPIs) => DashboardKPIs)) => {
    console.log('DashboardKPIs updated:', value);
  };
  const deleteData = () => {
    console.log('DashboardKPIs deleted');
  };
  return [data, setData, deleteData];
};

export const useUser = (): [User, (value: User | ((current: User) => User)) => void, () => void] => {
  const userData: User = {
    id: '1',
    name: 'Admin',
    email: 'admin@climatrak.com',
    role: 'ADMIN',
    avatar: '/assets/avatar.png'
  };
  const [data] = useState<User>(userData);
  const setData = (value: User | ((current: User) => User)) => {
    console.log('User updated:', value);
  };
  const deleteData = () => {
    console.log('User deleted');
  };
  return [data, setData, deleteData];
};

// Hook para dados de gráficos centralizados
export const useChartData = (): [typeof MOCK_CHART_DATA, (value: typeof MOCK_CHART_DATA | ((current: typeof MOCK_CHART_DATA) => typeof MOCK_CHART_DATA)) => void, () => void] => {
  const [data] = useState<typeof MOCK_CHART_DATA>(MOCK_CHART_DATA);
  const setData = (value: typeof MOCK_CHART_DATA | ((current: typeof MOCK_CHART_DATA) => typeof MOCK_CHART_DATA)) => {
    console.log('ChartData updated:', value);
  };
  const deleteData = () => {
    console.log('ChartData deleted');
  };
  return [data, setData, deleteData];
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