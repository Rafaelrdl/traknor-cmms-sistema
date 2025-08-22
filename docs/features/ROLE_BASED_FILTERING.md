# Role-Based Data Filtering Documentation

## Overview

This system provides comprehensive role-based access control (RBAC) for data filtering in the TrakNor CMMS application. It ensures that users only see data they're authorized to access based on their role and organizational context.

## Architecture

### Core Components

1. **useDataFiltering Hook** (`src/hooks/useDataFiltering.ts`)
   - Main filtering logic for different data types
   - Role-based filtering rules
   - Data masking for sensitive fields

2. **FilteredDataProvider Component** (`src/components/data/FilteredDataProvider.tsx`)
   - Higher-order component for automatic data filtering
   - Provides filtered data through render props
   - Shows filtering statistics and warnings

3. **useDashboardFiltering Hook** (`src/hooks/useDashboardFiltering.ts`)
   - Specialized filtering for dashboard data
   - Aggregates data from multiple sources
   - Role-specific widget configurations

4. **useRoleBasedData Hook** (`src/components/data/FilteredDataProvider.tsx`)
   - Simple hook for applying role-based filtering to arrays
   - Returns filtered data with statistics

## Role Definitions

### Administrator (`admin`)
- **Access**: Complete access to all data and functions
- **Data**: Can see all records, including inactive/archived items
- **Fields**: Access to all data fields including sensitive financial information
- **Actions**: Can create, edit, delete, and manage all entities

### Technician (`technician`)
- **Access**: Operational access with sector-based restrictions
- **Data**: Can see work orders assigned to them or in their sectors
- **Fields**: Access to operational fields, limited financial data
- **Actions**: Can edit work orders, move inventory, manage procedures

### Requester (`requester`)
- **Access**: Limited access to own requests and basic information
- **Data**: Can only see their own solicitations and basic asset info
- **Fields**: Very limited field access, no sensitive operational data
- **Actions**: Can create and edit their own solicitations

## Data Filtering Rules

### Work Orders
```typescript
// Admin: Sees all work orders
// Technician: Sees work orders assigned to them or in their sectors
// Requester: Sees only their own requests/solicitations

if (role === 'admin') return true;
if (role === 'technician') {
  return item.assignedTo === userId || 
         userSectors.includes(item.sectorId) ||
         item.createdBy === userId;
}
if (role === 'requester') {
  return item.createdBy === userId;
}
```

### Assets
```typescript
// Admin: All assets including inactive
// Technician: Assets in their sectors/department
// Requester: Basic asset info in their sectors (no sensitive details)

if (role === 'admin') return true;
if (role === 'technician') {
  return userSectors.includes(item.sectorId) ||
         item.departmentId === userDepartment;
}
if (role === 'requester') {
  return userSectors.includes(item.sectorId) && item.active !== false;
}
```

### Inventory
```typescript
// Admin: All items including stock levels and costs
// Technician: All active items with stock levels
// Requester: Basic item info without stock levels

if (role === 'admin') return true;
if (role === 'technician') {
  return item.active !== false;
}
if (role === 'requester') {
  return item.active !== false; // But qty_on_hand will be masked
}
```

## Field-Level Security

### Data Masking
Different roles have access to different fields:

```typescript
const allowedFields = {
  admin: ['*'], // All fields
  technician: {
    workorder: ['id', 'name', 'status', 'priority', 'assignedTo', 'sectorId'],
    inventory: ['id', 'name', 'sku', 'qty_on_hand', 'unit', 'category']
  },
  requester: {
    workorder: ['id', 'name', 'status', 'type'],
    inventory: ['id', 'name', 'unit', 'category'] // No qty_on_hand
  }
};
```

## Usage Examples

### Using FilteredDataProvider

```tsx
import { FilteredDataProvider, DataFilterInfo } from '@/components/data/FilteredDataProvider';

function MyComponent({ data }) {
  return (
    <FilteredDataProvider 
      data={data} 
      dataType="workorder"
      filterOptions={{ includeInactive: false }}
    >
      {({ filteredData, filterStats, canViewAll }) => (
        <div>
          {filterStats.filtered > 0 && (
            <DataFilterInfo
              filterStats={filterStats}
              dataType="workorder"
              canViewAll={canViewAll}
            />
          )}
          
          <Table data={filteredData} />
        </div>
      )}
    </FilteredDataProvider>
  );
}
```

### Using useRoleBasedData Hook

```tsx
import { useRoleBasedData } from '@/components/data/FilteredDataProvider';

function InventoryList({ items }) {
  const { data: filteredItems, stats, role } = useRoleBasedData(
    items, 
    'inventory',
    { includeInactive: role === 'admin' }
  );

  return (
    <div>
      {stats.filtered > 0 && (
        <Alert>
          Showing {stats.visible} of {stats.total} items
        </Alert>
      )}
      
      <ItemGrid items={filteredItems} />
    </div>
  );
}
```

### Using useDataFiltering Directly

```tsx
import { useDataFiltering } from '@/hooks/useDataFiltering';

function CustomComponent({ workOrders, assets }) {
  const { filterWorkOrders, filterAssets, maskSensitiveData } = useDataFiltering();
  
  const filteredWO = filterWorkOrders(workOrders);
  const filteredAssets = filterAssets(assets);
  
  // Mask sensitive fields
  const maskedAssets = filteredAssets.map(asset => 
    maskSensitiveData(asset, 'asset')
  );

  return (
    <div>
      <WorkOrderList data={filteredWO} />
      <AssetList data={maskedAssets} />
    </div>
  );
}
```

### Dashboard Filtering

```tsx
import { useDashboardFiltering } from '@/hooks/useDashboardFiltering';

function Dashboard() {
  const { filterDashboard, getDashboardConfig } = useDashboardFiltering();
  const config = getDashboardConfig();
  
  const dashboardData = {
    kpis: [...],
    charts: [...],
    // ... other data
  };
  
  const filteredData = filterDashboard(dashboardData);

  return (
    <div>
      <h1>{config.title}</h1>
      <p>{config.description}</p>
      
      {config.availableWidgets.includes('kpis') && (
        <KPIGrid data={filteredData.kpis} />
      )}
      
      {config.availableWidgets.includes('workOrdersChart') && (
        <WorkOrderChart data={filteredData.workOrdersOverTime} />
      )}
    </div>
  );
}
```

## Action-Based Permissions

Use with the existing ACL system for UI elements:

```tsx
import { IfCan } from '@/components/auth/IfCan';
import { useRoleBasedData } from '@/components/data/FilteredDataProvider';

function AssetTable({ assets }) {
  const { data: filteredAssets } = useRoleBasedData(assets, 'asset');
  
  return (
    <table>
      {filteredAssets.map(asset => (
        <tr key={asset.id}>
          <td>{asset.name}</td>
          <td>
            <IfCan action="edit" subject="asset">
              <EditButton asset={asset} />
            </IfCan>
            
            <IfCan action="delete" subject="asset">
              <DeleteButton asset={asset} />
            </IfCan>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

## Visual Indicators

### Data Filter Info Component
Automatically shows filtering information to users:

```tsx
<DataFilterInfo
  filterStats={{ total: 100, visible: 75, filtered: 25 }}
  dataType="asset"
  canViewAll={false}
  className="mb-4"
/>
```

### Role Badges
Add badges to indicate filtered content:

```tsx
<CardTitle className="flex items-center gap-2">
  Inventory Items
  {role !== 'admin' && (
    <Badge variant="outline" className="text-xs">
      {role === 'requester' ? 'Limited View' : 'Filtered'}
    </Badge>
  )}
</CardTitle>
```

## Testing

### Unit Tests
Test filtering logic with different roles:

```tsx
import { renderHook } from '@testing-library/react';
import { useDataFiltering } from '@/hooks/useDataFiltering';

test('admin sees all data', () => {
  // Mock role as admin
  const { result } = renderHook(() => useDataFiltering());
  const filtered = result.current.filterWorkOrders(mockData);
  expect(filtered).toHaveLength(mockData.length);
});

test('technician sees filtered data', () => {
  // Mock role as technician
  const { result } = renderHook(() => useDataFiltering());
  const filtered = result.current.filterWorkOrders(mockData);
  expect(filtered.length).toBeLessThan(mockData.length);
});
```

### Integration Tests
Test complete user flows with Cypress:

```typescript
// cypress/e2e/role-based-filtering.cy.ts
describe('Role-based Data Filtering', () => {
  it('admin sees all data', () => {
    cy.setRole('admin');
    cy.visit('/assets');
    cy.get('[data-testid="asset-row"]').should('have.length', 10);
    cy.get('[data-testid="asset-edit"]').should('be.visible');
  });

  it('technician sees filtered data', () => {
    cy.setRole('technician');
    cy.visit('/assets');
    cy.get('[data-testid="asset-row"]').should('have.length', 6);
    cy.get('[data-testid="filter-info"]').should('contain', 'Filtrado');
  });
});
```

## Performance Considerations

### Memoization
Use React.memo and useMemo for expensive filtering operations:

```tsx
import { useMemo } from 'react';

const filteredData = useMemo(() => {
  return filterWorkOrders(data, options);
}, [data, options, role]);
```

### Virtual Scrolling
For large datasets, consider virtual scrolling:

```tsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ filteredData }) {
  return (
    <FixedSizeList
      itemCount={filteredData.length}
      itemSize={50}
      itemData={filteredData}
    >
      {ItemRenderer}
    </FixedSizeList>
  );
}
```

## Security Notes

1. **Client-side Only**: This filtering is for UX purposes. Server-side validation is required for real security.

2. **Data Masking**: Sensitive fields are removed from the client data, not just hidden.

3. **Consistent Application**: Apply filtering consistently across all data access points.

4. **Audit Trail**: Consider logging data access attempts for security monitoring.

## Troubleshooting

### Common Issues

1. **Data Not Filtering**: Check that the role is correctly set in localStorage and the useAbility hook is returning the expected role.

2. **Empty Filtered Results**: Verify that the mock user context (userSectors, departmentId) matches the data structure.

3. **Missing Fields**: Check the getAllowedDataFields function for the specific data type and role.

### Debug Utilities

```tsx
// Add to development builds
if (import.meta.env.DEV) {
  console.log('Role:', role);
  console.log('Original data:', data.length);
  console.log('Filtered data:', filteredData.length);
  console.log('User context:', userContext);
}
```

## Migration Guide

To add role-based filtering to existing components:

1. Import the filtering hooks
2. Replace direct data usage with filtered data
3. Add DataFilterInfo components
4. Update action buttons with IfCan components
5. Add role-appropriate badges and indicators
6. Write tests for the new filtering logic

This system provides a comprehensive, testable, and maintainable approach to role-based data access control in the TrakNor CMMS application.