import { useAbility } from './useAbility';
import type { Role } from '@/acl/abilities';

interface DataOwnership {
  createdBy?: string;
  assignedTo?: string;
  departmentId?: string;
  sectorId?: string;
  priority?: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  status?: string;
}

interface FilterOptions {
  includeArchived?: boolean;
  includeInactive?: boolean;
  onlyOwned?: boolean;
  maxPriority?: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  departments?: string[];
  sectors?: string[];
}

// Mock user context - in a real app this would come from auth
const mockUserContext = {
  id: 'current-user-id',
  departmentId: 'dept-maintenance',
  sectorIds: ['sector-hvac-1', 'sector-hvac-2'],
  role: 'technician' as Role,
};

export function useDataFiltering() {
  const { role, can } = useAbility();

  // Priority levels for filtering
  const priorityLevels = {
    'Baixa': 1,
    'Média': 2,
    'Alta': 3,
    'Crítica': 4,
  };

  /**
   * Filters work orders based on role permissions
   */
  function filterWorkOrders<T extends DataOwnership & { id: string; type?: string }>(
    data: T[], 
    options: FilterOptions = {}
  ): T[] {
    return data.filter(item => {
      // Admin can see all work orders
      if (role === 'admin') return true;

      // Technician can see work orders assigned to them or in their sectors
      if (role === 'technician') {
        // Can see all if they can manage work orders
        if (can('manage', 'workorder')) return true;
        
        // Can see items assigned to them
        if (item.assignedTo === mockUserContext.id) return true;
        
        // Can see items in their sectors
        if (item.sectorId && mockUserContext.sectorIds.includes(item.sectorId)) return true;
        
        // Can see items they created
        if (item.createdBy === mockUserContext.id) return true;
        
        return false;
      }

      // Requester can only see their own solicitations/requests
      if (role === 'requester') {
        return item.createdBy === mockUserContext.id;
      }

      return false;
    });
  }

  /**
   * Filters assets based on role permissions
   */
  function filterAssets<T extends DataOwnership & { id: string; active?: boolean }>(
    data: T[], 
    options: FilterOptions = {}
  ): T[] {
    return data.filter(item => {
      // Admin can see all assets
      if (role === 'admin') return true;

      // Include inactive assets only if explicitly requested and user has permission
      if (item.active === false && !options.includeInactive) {
        return can('manage', 'asset');
      }

      // Technician can see assets in their sectors
      if (role === 'technician') {
        if (item.sectorId && mockUserContext.sectorIds.includes(item.sectorId)) return true;
        if (item.departmentId === mockUserContext.departmentId) return true;
        return false;
      }

      // Requester can see assets they can request maintenance for
      if (role === 'requester') {
        if (item.sectorId && mockUserContext.sectorIds.includes(item.sectorId)) return true;
        return false;
      }

      return false;
    });
  }

  /**
   * Filters inventory items based on role permissions
   */
  function filterInventoryItems<T extends DataOwnership & { id: string; active?: boolean; qty_on_hand?: number }>(
    data: T[], 
    options: FilterOptions = {}
  ): T[] {
    return data.filter(item => {
      // Admin can see all items
      if (role === 'admin') return true;

      // Include inactive items only if explicitly requested and user has permission
      if (item.active === false && !options.includeInactive) {
        return can('manage', 'inventory');
      }

      // Technician can see all active inventory items
      if (role === 'technician') {
        return item.active !== false;
      }

      // Requester can only see basic inventory info (no sensitive stock levels)
      if (role === 'requester') {
        return item.active !== false;
      }

      return false;
    });
  }

  /**
   * Filters maintenance plans based on role permissions
   */
  function filterMaintenancePlans<T extends DataOwnership & { id: string; active?: boolean }>(
    data: T[], 
    options: FilterOptions = {}
  ): T[] {
    return data.filter(item => {
      // Admin can see all plans
      if (role === 'admin') return true;

      // Include inactive plans only if explicitly requested and user has permission
      if (item.active === false && !options.includeInactive) {
        return can('manage', 'plan');
      }

      // Technician can see plans for their sectors
      if (role === 'technician') {
        if (item.sectorId && mockUserContext.sectorIds.includes(item.sectorId)) return true;
        if (item.departmentId === mockUserContext.departmentId) return true;
        return false;
      }

      // Requester can see basic plan info but cannot modify
      if (role === 'requester') {
        return item.active !== false;
      }

      return false;
    });
  }

  /**
   * Filters procedures based on role permissions
   */
  function filterProcedures<T extends DataOwnership & { id: string; status?: string; category_id?: string }>(
    data: T[], 
    options: FilterOptions = {}
  ): T[] {
    return data.filter(item => {
      // Admin can see all procedures
      if (role === 'admin') return true;

      // Only show active procedures unless explicitly requested
      if (item.status === 'Inativo' && !options.includeInactive) {
        return can('manage', 'procedure');
      }

      // Technician can see procedures relevant to their work
      if (role === 'technician') {
        return item.status === 'Ativo';
      }

      // Requester can see basic procedure info
      if (role === 'requester') {
        return item.status === 'Ativo';
      }

      return false;
    });
  }

  /**
   * Filters metrics data based on role permissions
   */
  function filterMetricsData<T extends { sectorId?: string; departmentId?: string; sensitive?: boolean }>(
    data: T[], 
    options: FilterOptions = {}
  ): T[] {
    return data.filter(item => {
      // Admin can see all metrics
      if (role === 'admin') return true;

      // Hide sensitive metrics from non-admin users
      if (item.sensitive && role !== 'admin') return false;

      // Technician can see metrics for their sectors/department
      if (role === 'technician') {
        if (item.sectorId && mockUserContext.sectorIds.includes(item.sectorId)) return true;
        if (item.departmentId === mockUserContext.departmentId) return true;
        return !item.sectorId && !item.departmentId; // Global metrics
      }

      // Requester can see limited metrics
      if (role === 'requester') {
        if (item.sectorId && mockUserContext.sectorIds.includes(item.sectorId)) return true;
        return false;
      }

      return false;
    });
  }

  /**
   * Filters dashboard data based on role permissions
   */
  function filterDashboardData(dashboardData: any) {
    const filtered = { ...dashboardData };

    // Admin sees everything
    if (role === 'admin') return filtered;

    // Technician sees filtered data
    if (role === 'technician') {
      // Filter KPIs to show only relevant data
      if (filtered.kpis) {
        // Hide sensitive financial data
        delete filtered.kpis.totalCost;
        delete filtered.kpis.costPerWorkOrder;
      }

      // Filter work orders in charts
      if (filtered.workOrders) {
        filtered.workOrders = filterWorkOrders(filtered.workOrders);
      }

      // Filter assets
      if (filtered.assets) {
        filtered.assets = filterAssets(filtered.assets);
      }
    }

    // Requester sees very limited data
    if (role === 'requester') {
      // Only basic KPIs
      if (filtered.kpis) {
        const { openRequests, myRequests } = filtered.kpis;
        filtered.kpis = { openRequests, myRequests };
      }

      // Only their own requests
      if (filtered.requests) {
        filtered.requests = filtered.requests.filter((req: any) => req.createdBy === mockUserContext.id);
      }

      // No access to detailed work order data
      delete filtered.workOrders;
      delete filtered.maintenanceMetrics;
    }

    return filtered;
  }

  /**
   * Gets allowed data fields based on role permissions
   */
  function getAllowedDataFields(subject: string): string[] {
    const baseFields = ['id', 'name', 'title', 'description', 'createdAt', 'updatedAt'];
    
    if (role === 'admin') {
      // Admin can see all fields
      return ['*'];
    }

    if (role === 'technician') {
      switch (subject) {
        case 'workorder':
          return [...baseFields, 'status', 'priority', 'assignedTo', 'sectorId', 'equipmentId', 'type'];
        case 'asset':
          return [...baseFields, 'location', 'status', 'lastMaintenance', 'nextMaintenance', 'model', 'serial'];
        case 'inventory':
          return [...baseFields, 'sku', 'location', 'unit', 'category', 'reorderPoint'];
        case 'procedure':
          return [...baseFields, 'category', 'version', 'status'];
        default:
          return baseFields;
      }
    }

    if (role === 'requester') {
      switch (subject) {
        case 'workorder':
          return [...baseFields, 'status', 'type']; // Limited work order info
        case 'asset':
          return [...baseFields, 'location', 'status', 'model']; // Basic asset info
        case 'inventory':
          return [...baseFields, 'unit', 'category']; // No stock levels
        case 'solicitation':
          return [...baseFields, 'status', 'priority', 'sectorId', 'equipmentId', 'note'];
        default:
          return ['id', 'name', 'title'];
      }
    }

    return baseFields;
  }

  /**
   * Applies data masking based on role permissions
   */
  function maskSensitiveData<T extends Record<string, any>>(data: T, subject: string): Partial<T> {
    const allowedFields = getAllowedDataFields(subject);
    
    if (allowedFields.includes('*')) {
      return data;
    }

    const maskedData: Partial<T> = {};
    allowedFields.forEach(field => {
      if (field in data) {
        maskedData[field as keyof T] = data[field];
      }
    });

    return maskedData;
  }

  return {
    filterWorkOrders,
    filterAssets,
    filterInventoryItems,
    filterMaintenancePlans,
    filterProcedures,
    filterMetricsData,
    filterDashboardData,
    getAllowedDataFields,
    maskSensitiveData,
    userContext: mockUserContext,
  };
}