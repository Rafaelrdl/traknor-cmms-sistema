import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlansPage } from '@/pages/PlansPage';
import type { MaintenancePlan } from '@/models/plan';

// Mock the custom hooks
vi.mock('@/hooks/useMaintenancePlans', () => ({
  useMaintenancePlansNew: vi.fn(),
  updatePlanInList: vi.fn((plans, updatedPlan) => 
    plans.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
  )
}));

// Mock the modal component
vi.mock('@/components/PlanFormModal', () => ({
  PlanFormModal: ({ open, onOpenChange, plan, onSave }: any) => {
    if (!open) return null;
    
    return (
      <div data-testid="plan-form-modal">
        <div>Modal Title: {plan ? 'Edit Plan' : 'New Plan'}</div>
        <button onClick={() => onOpenChange(false)}>Close</button>
        <button 
          onClick={() => {
            const mockPlan: MaintenancePlan = {
              id: plan?.id || 'new-plan-1',
              name: 'Test Plan',
              frequency: 'Mensal',
              scope: {},
              tasks: [],
              status: 'Ativo',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            };
            onSave(mockPlan);
          }}
        >
          Save Plan
        </button>
      </div>
    );
  }
}));

describe('PlansPage', () => {
  const mockSetPlans = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should show empty state when no plans exist', () => {
      const { useMaintenancePlansNew } = require('@/hooks/useMaintenancePlans');
      useMaintenancePlansNew.mockReturnValue([[], mockSetPlans, vi.fn()]);
      
      render(<PlansPage />);
      
      expect(screen.getByText('Nenhum plano de manutenção cadastrado.')).toBeInTheDocument();
      expect(screen.getByText('Criar Primeiro Plano')).toBeInTheDocument();
    });

    it('should open new plan modal when clicking create first plan button', async () => {
      const { useMaintenancePlansNew } = require('@/hooks/useMaintenancePlans');
      useMaintenancePlansNew.mockReturnValue([[], mockSetPlans, vi.fn()]);
      
      const user = userEvent.setup();
      render(<PlansPage />);
      
      const createButton = screen.getByText('Criar Primeiro Plano');
      await user.click(createButton);
      
      expect(screen.getByTestId('plan-form-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Title: New Plan')).toBeInTheDocument();
    });
  });

  describe('Plans List', () => {
    const mockPlans: MaintenancePlan[] = [
      {
        id: 'plan-1',
        name: 'Plano Mensal - Climatizadores',
        description: 'Manutenção preventiva mensal',
        frequency: 'Mensal',
        scope: {
          location_name: 'Setor Administrativo'
        },
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'plan-2',
        name: 'Plano Trimestral - Splits',
        frequency: 'Trimestral',
        scope: {
          equipment_name: 'Split LG 12.000 BTUs'
        },
        tasks: [],
        status: 'Inativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'plan-3',
        name: 'Plano Geral',
        frequency: 'Anual',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    beforeEach(() => {
      const { useMaintenancePlansNew } = require('@/hooks/useMaintenancePlans');
      useMaintenancePlansNew.mockReturnValue([mockPlans, mockSetPlans, vi.fn()]);
    });

    it('should render plans table with correct data', () => {
      render(<PlansPage />);
      
      expect(screen.getByText('Plano Mensal - Climatizadores')).toBeInTheDocument();
      expect(screen.getByText('Plano Trimestral - Splits')).toBeInTheDocument();
      expect(screen.getByText('Plano Geral')).toBeInTheDocument();
      
      // Check frequencies
      expect(screen.getByText('Mensal')).toBeInTheDocument();
      expect(screen.getByText('Trimestral')).toBeInTheDocument();
      expect(screen.getByText('Anual')).toBeInTheDocument();
    });

    it('should display correct scope information', () => {
      render(<PlansPage />);
      
      expect(screen.getByText('Setor Administrativo')).toBeInTheDocument();
      expect(screen.getByText('Split LG 12.000 BTUs')).toBeInTheDocument();
      expect(screen.getAllByText('Geral')).toHaveLength(1); // Plan without scope
    });

    it('should display correct status badges', () => {
      render(<PlansPage />);
      
      const statusBadges = screen.getAllByText(/^(Ativo|Inativo)$/);
      expect(statusBadges).toHaveLength(3);
      
      // Check that we have both active and inactive plans
      expect(screen.getAllByText('Ativo')).toHaveLength(2);
      expect(screen.getAllByText('Inativo')).toHaveLength(1);
    });

    it('should show plan descriptions when available', () => {
      render(<PlansPage />);
      
      expect(screen.getByText('Manutenção preventiva mensal')).toBeInTheDocument();
    });
  });

  describe('Plan Actions', () => {
    const mockPlans: MaintenancePlan[] = [
      {
        id: 'plan-1',
        name: 'Test Plan',
        frequency: 'Mensal',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    beforeEach(() => {
      const { useMaintenancePlansNew } = require('@/hooks/useMaintenancePlans');
      useMaintenancePlansNew.mockReturnValue([mockPlans, mockSetPlans, vi.fn()]);
    });

    it('should open new plan modal when clicking novo plano button', async () => {
      const user = userEvent.setup();
      render(<PlansPage />);
      
      const newPlanButton = screen.getByText('Novo Plano');
      await user.click(newPlanButton);
      
      expect(screen.getByTestId('plan-form-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Title: New Plan')).toBeInTheDocument();
    });

    it('should open edit plan modal when clicking edit button', async () => {
      const user = userEvent.setup();
      render(<PlansPage />);
      
      const editButton = screen.getByLabelText('Editar plano Test Plan');
      await user.click(editButton);
      
      expect(screen.getByTestId('plan-form-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Title: Edit Plan')).toBeInTheDocument();
    });

    it('should add new plan to list when saving from modal', async () => {
      const user = userEvent.setup();
      render(<PlansPage />);
      
      // Open new plan modal
      const newPlanButton = screen.getByText('Novo Plano');
      await user.click(newPlanButton);
      
      // Save plan
      const savePlanButton = screen.getByText('Save Plan');
      await user.click(savePlanButton);
      
      await waitFor(() => {
        expect(mockSetPlans).toHaveBeenCalledWith(
          expect.any(Function)
        );
      });
    });

    it('should update existing plan in list when saving edited plan', async () => {
      const { updatePlanInList } = require('@/hooks/useMaintenancePlans');
      const user = userEvent.setup();
      render(<PlansPage />);
      
      // Open edit plan modal
      const editButton = screen.getByLabelText('Editar plano Test Plan');
      await user.click(editButton);
      
      // Save plan
      const savePlanButton = screen.getByText('Save Plan');
      await user.click(savePlanButton);
      
      await waitFor(() => {
        expect(mockSetPlans).toHaveBeenCalledWith(
          expect.any(Function)
        );
      });
    });
  });

  describe('Accessibility', () => {
    const mockPlans: MaintenancePlan[] = [
      {
        id: 'plan-1',
        name: 'Test Plan',
        frequency: 'Mensal',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    beforeEach(() => {
      const { useMaintenancePlansNew } = require('@/hooks/useMaintenancePlans');
      useMaintenancePlansNew.mockReturnValue([mockPlans, mockSetPlans, vi.fn()]);
    });

    it('should have proper table structure with headers', () => {
      render(<PlansPage />);
      
      const table = screen.getByRole('grid');
      expect(table).toBeInTheDocument();
      
      // Check table headers
      expect(screen.getByRole('columnheader', { name: 'Nome do Plano' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Frequência' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Escopo' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Ações' })).toBeInTheDocument();
    });

    it('should have aria-label for edit buttons', () => {
      render(<PlansPage />);
      
      const editButton = screen.getByLabelText('Editar plano Test Plan');
      expect(editButton).toBeInTheDocument();
    });

    it('should have proper page header with title and description', () => {
      render(<PlansPage />);
      
      expect(screen.getByText('Planos de Manutenção')).toBeInTheDocument();
      expect(screen.getByText('Planejamento de manutenções preventivas')).toBeInTheDocument();
    });
  });
});