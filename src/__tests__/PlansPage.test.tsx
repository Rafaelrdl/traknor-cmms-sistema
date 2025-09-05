import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock all dependencies before importing the component
vi.mock('@/hooks/useMaintenancePlans', () => ({
  useMaintenancePlansNew: () => [
    [
      {
        id: 'plan-1',
        name: 'Plano Mensal - Climatizadores',
        description: 'Manutenção preventiva mensal',
        frequency: 'Mensal',
        scope: { location_name: 'Prédio A' },
        tasks: [],
        status: 'Ativo',
        auto_generate: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    vi.fn(), // setPlans
    vi.fn()  // deletePlans
  ],
  updatePlanInList: vi.fn()
}));

vi.mock('@/components/PlanFormModal', () => ({
  PlanFormModal: () => null
}));

vi.mock('@/components/auth/IfCan', () => ({
  IfCanCreate: ({ children }: any) => children,
  IfCanEdit: ({ children }: any) => children,
}));

vi.mock('@/data/workOrdersStore', () => ({
  generateWorkOrdersFromPlan: vi.fn(),
}));

vi.mock('@/data/plansStore', () => ({
  updatePlanNextExecution: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// Now import the component
import { PlansPage } from '@/pages/PlansPage';

describe('PlansPage', () => {
  it('renders the page title', () => {
    render(<PlansPage />);
    expect(screen.getByText('Planos de Manutenção')).toBeInTheDocument();
  });

  it('renders plans table with data', () => {
    render(<PlansPage />);
    
    // Check if the table is rendered
    const table = screen.getByRole('grid');
    expect(table).toBeInTheDocument();
    
    // Check if the plan data is rendered
    expect(screen.getByText('Plano Mensal - Climatizadores')).toBeInTheDocument();
    expect(screen.getByText('Manutenção preventiva mensal')).toBeInTheDocument();
    expect(screen.getByText('Mensal')).toBeInTheDocument();
  });

  it('should have proper table structure with headers', () => {
    render(<PlansPage />);
    
    const table = screen.getByRole('grid');
    expect(table).toBeInTheDocument();
    
    expect(screen.getByText('Nome do Plano')).toBeInTheDocument();
    expect(screen.getByText('Frequência')).toBeInTheDocument();
    expect(screen.getByText('Escopo')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });
});
