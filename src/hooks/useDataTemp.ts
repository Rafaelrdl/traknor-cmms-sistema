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
  DashboardKPIs,
  Solicitation
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
  MOCK_CHART_DATA,
  MOCK_SOLICITATIONS
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
  const [data, setData] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  
  const updateData = (value: WorkOrder[] | ((current: WorkOrder[]) => WorkOrder[])) => {
    if (typeof value === 'function') {
      setData(current => value(current));
    } else {
      setData(value);
    }
  };

  const deleteData = () => {
    setData([]);
  };
  
  return [data, updateData, deleteData];
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

// Alias for useStock to match component expectations
export const useStockItems = useStock;

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
    email: 'admin@traknor.com',
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
  const [data] = useState(MOCK_CHART_DATA);
  const setData = (value: typeof MOCK_CHART_DATA | ((current: typeof MOCK_CHART_DATA) => typeof MOCK_CHART_DATA)) => {
    console.log('Chart data updated:', value);
  };
  const deleteData = () => {
    console.log('Chart data deleted');
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

export const useSolicitations = (): [Solicitation[], (value: Solicitation[] | ((current: Solicitation[]) => Solicitation[])) => void, () => void] => {
  const [data, setData] = useState<Solicitation[]>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('traknor-solicitations');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.warn('Error parsing stored solicitations:', e);
        }
      }
    }
    return MOCK_SOLICITATIONS;
  });
  
  const updateData = (value: Solicitation[] | ((current: Solicitation[]) => Solicitation[])) => {
    let newData: Solicitation[];
    if (typeof value === 'function') {
      newData = value(data);
      setData(newData);
    } else {
      newData = value;
      setData(newData);
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('traknor-solicitations', JSON.stringify(newData));
    }
  };

  const deleteData = () => {
    setData([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('traknor-solicitations');
    }
  };
  
  return [data, updateData, deleteData];
};

// Hook utilitário para buscar qualquer item por ID
export const useFindById = <T extends { id: string }>(
  collection: T[],
  id: string | undefined
) => {
  if (!id) return null;
  return collection.find(item => item.id === id) || null;
};

export const findSolicitationById = (id: string) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('traknor-solicitations');
    if (stored) {
      try {
        const solicitations: Solicitation[] = JSON.parse(stored);
        return solicitations.find(solicitation => solicitation.id === id);
      } catch (e) {
        console.warn('Error parsing stored solicitations:', e);
      }
    }
  }
  return MOCK_SOLICITATIONS.find(solicitation => solicitation.id === id);
};

// Utility functions for solicitations business logic
export const canAdvanceStatus = (solicitation: Solicitation): boolean => {
  switch (solicitation.status) {
    case 'Nova':
      return true; // Can go to 'Em triagem'
    case 'Em triagem':
      return true; // Can go to 'Convertida em OS'
    case 'Convertida em OS':
      return false; // Final status
    default:
      return false;
  }
};

export const getNextStatus = (currentStatus: Solicitation['status']): Solicitation['status'] | null => {
  switch (currentStatus) {
    case 'Nova':
      return 'Em triagem';
    case 'Em triagem':
      return 'Convertida em OS';
    default:
      return null;
  }
};

export const advanceSolicitationStatus = (solicitation: Solicitation): Solicitation | null => {
  if (!canAdvanceStatus(solicitation)) {
    return null;
  }

  const nextStatus = getNextStatus(solicitation.status);
  if (!nextStatus) {
    return null;
  }

  return {
    ...solicitation,
    status: nextStatus,
    status_history: [
      ...solicitation.status_history,
      {
        from: solicitation.status,
        to: nextStatus,
        at: new Date().toISOString()
      }
    ],
    updated_at: new Date().toISOString()
  };
};

export const addSolicitationItem = (
  solicitation: Solicitation, 
  stockItemId: string, 
  stockItemName: string,
  unit: string,
  qty: number
): Solicitation => {
  // Check if item already exists
  const existingItemIndex = solicitation.items.findIndex(item => item.stock_item_id === stockItemId);
  
  let updatedItems: typeof solicitation.items;
  
  if (existingItemIndex >= 0) {
    // Sum quantities if item exists
    updatedItems = solicitation.items.map((item, index) =>
      index === existingItemIndex
        ? { ...item, qty: item.qty + qty }
        : item
    );
  } else {
    // Add new item
    updatedItems = [
      ...solicitation.items,
      {
        id: `item-${Date.now()}`,
        stock_item_id: stockItemId,
        stock_item_name: stockItemName,
        unit,
        qty
      }
    ];
  }

  return {
    ...solicitation,
    items: updatedItems,
    updated_at: new Date().toISOString()
  };
};

export const removeSolicitationItem = (solicitation: Solicitation, itemId: string): Solicitation => {
  return {
    ...solicitation,
    items: solicitation.items.filter(item => item.id !== itemId),
    updated_at: new Date().toISOString()
  };
};

export const convertSolicitationToWorkOrder = (solicitation: Solicitation): WorkOrder => {
  const workOrderNumber = `OS-${String(Date.now()).slice(-6)}`;
  
  return {
    id: `wo-${Date.now()}`,
    number: workOrderNumber,
    equipmentId: solicitation.equipment_id,
    type: 'CORRECTIVE',
    status: 'OPEN',
    scheduledDate: new Date().toISOString(),
    priority: 'MEDIUM',
    description: `Convertida da solicitação: ${solicitation.note || 'Sem observações'}`,
    stockItems: solicitation.items.map(item => ({
      id: `wosi-${Date.now()}-${item.id}`,
      workOrderId: `wo-${Date.now()}`,
      stockItemId: item.stock_item_id,
      quantity: item.qty,
      stockItem: {
        id: item.stock_item_id,
        code: item.stock_item_id,
        description: item.stock_item_name,
        unit: item.unit || 'un',
        quantity: item.qty,
        minimum: 0,
        maximum: 100
      }
    }))
  };
};