import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDataFiltering } from '@/hooks/useDataFiltering';
import { useAbility } from '@/hooks/useAbility';
import { getCurrentRole, setCurrentRole } from '@/data/authStore';

// Mock the auth store
vi.mock('@/data/authStore', () => ({
  useCurrentRole: vi.fn(),
  getCurrentRole: vi.fn(),
  setCurrentRole: vi.fn(),
}));

// Mock the ability hook
vi.mock('@/hooks/useAbility', () => ({
  useAbility: vi.fn(),
}));

describe('useDataFiltering', () => {
  const mockWorkOrders = [
    {
      id: '1',
      title: 'Fix HVAC Unit 1',
      assignedTo: 'current-user-id',
      sectorId: 'sector-hvac-1',
      createdBy: 'other-user',
      status: 'OPEN',
      priority: 'Alta' as const,
    },
    {
      id: '2',
      title: 'Maintenance Unit 2',
      assignedTo: 'other-user',
      sectorId: 'sector-hvac-2',
      createdBy: 'current-user-id',
      status: 'OPEN',
      priority: 'Média' as const,
    },
    {
      id: '3',
      title: 'Emergency Repair',
      assignedTo: 'other-user',
      sectorId: 'sector-other',
      createdBy: 'other-user',
      status: 'OPEN',
      priority: 'Crítica' as const,
    },
  ];

  const mockAssets = [
    {
      id: '1',
      name: 'HVAC Unit A',
      sectorId: 'sector-hvac-1',
      active: true,
      createdBy: 'current-user-id',
    },
    {
      id: '2',
      name: 'HVAC Unit B',
      sectorId: 'sector-hvac-2',
      active: true,
      createdBy: 'other-user',
    },
    {
      id: '3',
      name: 'HVAC Unit C (Inactive)',
      sectorId: 'sector-other',
      active: false,
      createdBy: 'other-user',
    },
  ];

  const mockInventoryItems = [
    {
      id: '1',
      name: 'Filter Type A',
      active: true,
      qty_on_hand: 50,
      departmentId: 'dept-maintenance',
      createdBy: 'current-user-id',
    },
    {
      id: '2',
      name: 'Sensitive Component',
      active: true,
      qty_on_hand: 5,
      departmentId: 'dept-other',
      createdBy: 'other-user',
    },
    {
      id: '3',
      name: 'Inactive Item',
      active: false,
      qty_on_hand: 0,
      departmentId: 'dept-maintenance',
      createdBy: 'current-user-id',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      (useAbility as any).mockReturnValue({
        role: 'admin',
        can: () => true,
      });
    });

    it('should see all work orders', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterWorkOrders(mockWorkOrders);
      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(mockWorkOrders);
    });

    it('should see all assets including inactive', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterAssets(mockAssets);
      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(mockAssets);
    });

    it('should see all inventory items including inactive', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterInventoryItems(mockInventoryItems);
      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(mockInventoryItems);
    });

    it('should have access to all data fields', () => {
      const { result } = renderHook(() => useDataFiltering());
      const allowedFields = result.current.getAllowedDataFields('workorder');
      expect(allowedFields).toEqual(['*']);
    });
  });

  describe('Technician Role', () => {
    beforeEach(() => {
      (useAbility as any).mockReturnValue({
        role: 'technician',
        can: (action: string, subject: string) => {
          if (action === 'manage' && subject === 'workorder') return false;
          if (action === 'edit' && subject === 'inventory') return true;
          return false;
        },
      });
    });

    it('should see work orders assigned to them or in their sectors', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterWorkOrders(mockWorkOrders);
      expect(filtered).toHaveLength(2); // assigned to them + in their sector
      expect(filtered.map(wo => wo.id)).toEqual(['1', '2']);
    });

    it('should see assets in their sectors', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterAssets(mockAssets);
      expect(filtered).toHaveLength(2); // in their sectors
      expect(filtered.map(asset => asset.id)).toEqual(['1', '2']);
    });

    it('should see all active inventory items but not quantities for some', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterInventoryItems(mockInventoryItems);
      expect(filtered).toHaveLength(2); // only active items
      expect(filtered.every(item => item.active)).toBe(true);
    });

    it('should have limited data fields access', () => {
      const { result } = renderHook(() => useDataFiltering());
      const allowedFields = result.current.getAllowedDataFields('workorder');
      expect(allowedFields).toContain('status');
      expect(allowedFields).toContain('priority');
      expect(allowedFields).not.toContain('*');
    });

    it('should mask sensitive data', () => {
      const { result } = renderHook(() => useDataFiltering());
      const sensitiveData = { 
        id: '1', 
        name: 'Test', 
        cost: 1000, 
        secretField: 'sensitive' 
      };
      const masked = result.current.maskSensitiveData(sensitiveData, 'inventory');
      expect(masked).not.toHaveProperty('cost');
      expect(masked).not.toHaveProperty('secretField');
      expect(masked).toHaveProperty('id');
      expect(masked).toHaveProperty('name');
    });
  });

  describe('Requester Role', () => {
    beforeEach(() => {
      (useAbility as any).mockReturnValue({
        role: 'requester',
        can: (action: string, subject: string) => {
          if (action === 'create' && subject === 'solicitation') return true;
          return false;
        },
      });
    });

    it('should only see their own work orders/requests', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterWorkOrders(mockWorkOrders);
      expect(filtered).toHaveLength(1); // only their own
      expect(filtered[0].id).toBe('2'); // created by them
    });

    it('should see assets in their sectors only', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterAssets(mockAssets);
      expect(filtered).toHaveLength(2); // in their sectors
      expect(filtered.map(asset => asset.id)).toEqual(['1', '2']);
    });

    it('should see basic inventory info without sensitive details', () => {
      const { result } = renderHook(() => useDataFiltering());
      const filtered = result.current.filterInventoryItems(mockInventoryItems);
      expect(filtered).toHaveLength(2); // only active items
      expect(filtered.every(item => item.active)).toBe(true);
    });

    it('should have very limited data fields access', () => {
      const { result } = renderHook(() => useDataFiltering());
      const allowedFields = result.current.getAllowedDataFields('inventory');
      expect(allowedFields).not.toContain('qty_on_hand');
      expect(allowedFields).not.toContain('cost');
      expect(allowedFields).toContain('name');
      expect(allowedFields).toContain('category');
    });

    it('should heavily mask sensitive data', () => {
      const { result } = renderHook(() => useDataFiltering());
      const sensitiveData = { 
        id: '1', 
        name: 'Test', 
        qty_on_hand: 50,
        cost: 1000, 
        unit: 'un',
        category: 'filters'
      };
      const masked = result.current.maskSensitiveData(sensitiveData, 'inventory');
      expect(masked).not.toHaveProperty('qty_on_hand');
      expect(masked).not.toHaveProperty('cost');
      expect(masked).toHaveProperty('id');
      expect(masked).toHaveProperty('name');
      expect(masked).toHaveProperty('unit');
      expect(masked).toHaveProperty('category');
    });
  });

  describe('Dashboard Filtering', () => {
    it('should filter dashboard data based on role', () => {
      (useAbility as any).mockReturnValue({
        role: 'technician',
        can: () => false,
      });

      const { result } = renderHook(() => useDataFiltering());
      const mockDashboardData = {
        kpis: {
          openWorkOrders: 10,
          totalCost: 50000,
          costPerWorkOrder: 5000,
        },
        workOrders: mockWorkOrders,
        assets: mockAssets,
      };

      const filtered = result.current.filterDashboardData(mockDashboardData);
      expect(filtered.kpis).not.toHaveProperty('totalCost');
      expect(filtered.kpis).not.toHaveProperty('costPerWorkOrder');
      expect(filtered.kpis).toHaveProperty('openWorkOrders');
      expect(filtered.workOrders).toHaveLength(2); // filtered work orders
    });

    it('should heavily filter dashboard for requesters', () => {
      (useAbility as any).mockReturnValue({
        role: 'requester',
        can: () => false,
      });

      const { result } = renderHook(() => useDataFiltering());
      const mockDashboardData = {
        kpis: {
          openWorkOrders: 10,
          myRequests: 3,
          totalCost: 50000,
        },
        workOrders: mockWorkOrders,
        assets: mockAssets,
        maintenanceMetrics: { mttr: 4, mtbf: 100 },
      };

      const filtered = result.current.filterDashboardData(mockDashboardData);
      expect(filtered.kpis).toEqual({ myRequests: 3 });
      expect(filtered).not.toHaveProperty('workOrders');
      expect(filtered).not.toHaveProperty('maintenanceMetrics');
    });
  });
});