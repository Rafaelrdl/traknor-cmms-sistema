import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FilteredDataProvider, DataFilterInfo, useRoleBasedData } from '@/components/data/FilteredDataProvider';
import { useAbility } from '@/hooks/useAbility';

// Mock the hooks
vi.mock('@/hooks/useAbility', () => ({
  useAbility: vi.fn(),
}));

vi.mock('@/hooks/useDataFiltering', () => ({
  useDataFiltering: vi.fn().mockReturnValue({
    filterWorkOrders: vi.fn(data => data),
    filterAssets: vi.fn(data => data),
    filterInventoryItems: vi.fn(data => data),
    filterMaintenancePlans: vi.fn(data => data),
    filterProcedures: vi.fn(data => data),
    filterMetricsData: vi.fn(data => data),
    maskSensitiveData: vi.fn(data => data),
  }),
}));

describe('FilteredDataProvider', () => {
  const mockData = [
    { id: '1', name: 'Item 1', active: true },
    { id: '2', name: 'Item 2', active: false },
    { id: '3', name: 'Item 3', active: true },
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

    it('should render all data for admin users', () => {
      render(
        <FilteredDataProvider data={mockData} dataType="asset">
          {({ filteredData, filterStats }) => (
            <div>
              <div data-testid="item-count">{filteredData.length}</div>
              <div data-testid="filter-stats">{filterStats.filtered}</div>
            </div>
          )}
        </FilteredDataProvider>
      );

      expect(screen.getByTestId('item-count')).toHaveTextContent('3');
      expect(screen.getByTestId('filter-stats')).toHaveTextContent('0');
    });
  });

  describe('Non-Admin Roles', () => {
    beforeEach(() => {
      (useAbility as any).mockReturnValue({
        role: 'technician',
        can: (action: string, subject: string) => action !== 'manage',
      });
    });

    it('should show filtered data count', () => {
      render(
        <FilteredDataProvider data={mockData} dataType="asset">
          {({ filteredData, filterStats, canViewAll }) => (
            <div>
              <div data-testid="item-count">{filteredData.length}</div>
              <div data-testid="can-view-all">{canViewAll.toString()}</div>
              <div data-testid="filter-stats">{filterStats.total}</div>
            </div>
          )}
        </FilteredDataProvider>
      );

      expect(screen.getByTestId('can-view-all')).toHaveTextContent('false');
      expect(screen.getByTestId('filter-stats')).toHaveTextContent('3');
    });
  });
});

describe('DataFilterInfo', () => {
  it('should not render when no items are filtered', () => {
    const { container } = render(
      <DataFilterInfo
        filterStats={{ total: 10, visible: 10, filtered: 0 }}
        dataType="asset"
        canViewAll={false}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render filter information when items are filtered', () => {
    render(
      <DataFilterInfo
        filterStats={{ total: 10, visible: 7, filtered: 3 }}
        dataType="asset"
        canViewAll={false}
      />
    );

    expect(screen.getByText(/Visualização filtrada por permissões/i)).toBeInTheDocument();
    expect(screen.getByText(/Mostrando 7 de 10 ativos/i)).toBeInTheDocument();
    expect(screen.getByText(/3 ativos não estão visíveis/i)).toBeInTheDocument();
  });

  it('should show different messages for different roles', () => {
    // Mock the useAbility hook to return technician role
    (useAbility as any).mockReturnValue({
      role: 'technician',
      can: () => false,
    });

    render(
      <DataFilterInfo
        filterStats={{ total: 10, visible: 7, filtered: 3 }}
        dataType="workorder"
        canViewAll={false}
      />
    );

    expect(screen.getByText(/permissões de técnico/i)).toBeInTheDocument();
  });

  it('should show admin contact message for non-admin users', () => {
    (useAbility as any).mockReturnValue({
      role: 'requester',
      can: () => false,
    });

    render(
      <DataFilterInfo
        filterStats={{ total: 10, visible: 7, filtered: 3 }}
        dataType="asset"
        canViewAll={false}
      />
    );

    expect(screen.getByText(/entre em contato com um administrador/i)).toBeInTheDocument();
  });
});

describe('useRoleBasedData', () => {
  const mockInventoryData = [
    {
      id: '1',
      name: 'Filter A',
      active: true,
      qty_on_hand: 50,
      reorder_point: 10,
      category: 'filters',
    },
    {
      id: '2',
      name: 'Filter B (Inactive)',
      active: false,
      qty_on_hand: 0,
      reorder_point: 5,
      category: 'filters',
    },
    {
      id: '3',
      name: 'Pump C',
      active: true,
      qty_on_hand: 3,
      reorder_point: 2,
      category: 'pumps',
    },
  ];

  it('should filter data correctly for different roles', () => {
    // Test admin role
    (useAbility as any).mockReturnValue({
      role: 'admin',
      can: () => true,
    });

    let result = useRoleBasedData(mockInventoryData, 'inventory');
    expect(result.data).toHaveLength(3); // Admin sees all
    expect(result.stats.filtered).toBe(0);

    // Test technician role
    (useAbility as any).mockReturnValue({
      role: 'technician',
      can: (action: string) => action !== 'manage',
    });

    result = useRoleBasedData(mockInventoryData, 'inventory');
    expect(result.data).toHaveLength(2); // Technician sees only active
    expect(result.stats.filtered).toBe(1);

    // Test requester role
    (useAbility as any).mockReturnValue({
      role: 'requester',
      can: (action: string) => action === 'view',
    });

    result = useRoleBasedData(mockInventoryData, 'inventory');
    expect(result.data).toHaveLength(2); // Requester sees only active
    expect(result.stats.filtered).toBe(1);
  });

  it('should return correct statistics', () => {
    (useAbility as any).mockReturnValue({
      role: 'technician',
      can: () => false,
    });

    const result = useRoleBasedData(mockInventoryData, 'inventory');
    
    expect(result.stats.total).toBe(3);
    expect(result.stats.visible).toBe(2);
    expect(result.stats.filtered).toBe(1);
    expect(result.role).toBe('technician');
  });

  it('should handle empty data gracefully', () => {
    (useAbility as any).mockReturnValue({
      role: 'admin',
      can: () => true,
    });

    const result = useRoleBasedData([], 'inventory');
    
    expect(result.data).toEqual([]);
    expect(result.stats.total).toBe(0);
    expect(result.stats.visible).toBe(0);
    expect(result.stats.filtered).toBe(0);
  });
});