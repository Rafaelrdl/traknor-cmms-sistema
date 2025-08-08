# Work Orders Panel View - Gmail-Inspired Implementation

## Overview

This document details the implementation of the Gmail-inspired Panel view for Work Orders in the TrakNor CMMS system. The panel view provides a split-pane interface with a compact work order list on the right and detailed view on the left.

## Architecture

### Key Components

1. **PanelLayout** (`/components/PanelLayout.tsx`)
   - Responsive split-pane wrapper
   - Handles desktop (72%/28%) and tablet (65%/35%) layouts
   - Mobile-first approach with single pane on small screens

2. **WorkOrderDetails** (`/components/WorkOrderDetails.tsx`)
   - Detailed work order information display
   - Skeleton loading states
   - Empty state with selection prompt
   - Action buttons integration

3. **WorkOrderList** (`/components/WorkOrderList.tsx`)
   - Enhanced with compact mode support
   - Keyboard navigation support
   - Visual selection indicators

4. **WorkOrderStore** (`/store/useWorkOrderStore.ts`)
   - Zustand-based state management
   - Persistent selection via localStorage
   - URL deep-linking support

## Features

### Visual Design

- **Selection Indicators**: Selected items have light blue background (#f1f7f9) with left border (#006b76)
- **Hover Effects**: Subtle hover state (#f5fafa)
- **Overdue Items**: Red left border for overdue work orders
- **Responsive Breakpoints**: 
  - Desktop ≥1280px: 72%/28% split
  - Tablet 768-1279px: 65%/35% split
  - Mobile <768px: List-only view

### Accessibility

- **Keyboard Navigation**: Arrow keys (↑↓) navigate between items
- **Focus Management**: Visible focus rings with proper contrast
- **ARIA Roles**: `role="option"` and `aria-selected` attributes
- **Screen Reader Support**: Descriptive labels and status announcements

### Functionality

- **Deep Linking**: URL query parameter `?wo=ID` for direct work order access
- **State Persistence**: Selected work order persists across page reloads
- **Loading States**: Skeleton loading during work order transitions
- **Empty States**: Informative placeholder when no work order is selected

## Usage

```tsx
import { WorkOrderPanel } from '@/components/WorkOrderPanel';

<WorkOrderPanel
  workOrders={filteredOrders}
  onStartWorkOrder={startWorkOrder}
  onExecuteWorkOrder={handleExecuteWorkOrder}
  onEditWorkOrder={setEditingOrder}
/>
```

## State Management

The panel view uses a Zustand store for managing the selected work order:

```typescript
const { 
  selectedWorkOrder, 
  selectedWorkOrderId, 
  setSelectedWorkOrder, 
  clearSelection 
} = useWorkOrderStore();
```

## Keyboard Shortcuts

- `↑` / `↓` - Navigate between work orders
- `Enter` - Select/deselect work order
- `Escape` - Clear selection

## Mobile Considerations

On mobile devices (<768px), the panel view shows only the work order list. In future iterations, tapping a work order could navigate to a full-screen detail view.

## Testing

Unit tests are provided for the PanelLayout component with mocked breakpoint hooks. Integration tests cover the full workflow including selection, navigation, and state persistence.

## Performance

- Skeleton loading reduces perceived latency
- Efficient re-renders using React.memo where appropriate
- Minimal DOM updates during selection changes
- Lazy loading of work order details

## Browser Support

Compatible with all modern browsers supporting:
- CSS Grid and Flexbox
- ES6+ features
- Local Storage API
- URL API

---

## Implementation Notes

### CSS Classes Used

- `.border-l-3` - 3px left border utility
- Focus management classes from global styles
- Responsive utilities from Tailwind CSS

### Dependencies Added

- `zustand` - State management
- No additional external dependencies

### File Structure

```
src/
├── components/
│   ├── PanelLayout.tsx
│   ├── WorkOrderDetails.tsx
│   ├── WorkOrderPanel.tsx (refactored)
│   ├── WorkOrderList.tsx (enhanced)
│   └── __tests__/
│       └── PanelLayout.test.tsx
└── store/
    └── useWorkOrderStore.ts
```