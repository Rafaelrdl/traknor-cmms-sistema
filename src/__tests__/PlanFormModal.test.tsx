import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanFormModal } from '@/components/PlanFormModal';
import type { MaintenancePlan } from '@/models/plan';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/hooks/useDataTemp', () => ({
  useCompanies: () => [[
    { id: '1', name: 'Company 1' },
    { id: '2', name: 'Company 2' }
  ], vi.fn(), vi.fn()],
  useSectors: () => [[
    { id: 'sector-1', name: 'Sector 1' },
    { id: 'sector-2', name: 'Sector 2' }
  ], vi.fn(), vi.fn()],
  useEquipment: () => [[
    { id: 'eq-1', tag: 'EQ-001', model: 'Model 1' },
    { id: 'eq-2', tag: 'EQ-002', model: 'Model 2' }
  ], vi.fn(), vi.fn()]
}));

vi.mock('@/data/plansStore', () => ({
  createPlan: vi.fn(),
  updatePlan: vi.fn()
}));

const mockOnOpenChange = vi.fn();
const mockOnSave = vi.fn();

describe('PlanFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSave: mockOnSave
  };

  describe('New Plan Mode', () => {
    it('should render with correct title for new plan', () => {
      render(<PlanFormModal {...defaultProps} />);
      
      expect(screen.getByText('Novo Plano de Manutenção')).toBeInTheDocument();
    });

    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      const submitButton = screen.getByText('Salvar');
      await user.click(submitButton);
      
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Frequência é obrigatória')).toBeInTheDocument();
    });

    it('should validate minimum name length', async () => {
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/Nome do Plano/);
      await user.type(nameInput, 'AB'); // Less than 3 characters
      
      const submitButton = screen.getByText('Salvar');
      await user.click(submitButton);
      
      expect(screen.getByText('Nome deve ter pelo menos 3 caracteres')).toBeInTheDocument();
    });

    it('should create plan with valid data', async () => {
      const { createPlan } = await import('@/data/plansStore');
      const mockCreatedPlan: MaintenancePlan = {
        id: 'plan-1',
        name: 'Test Plan',
        description: 'Test Description',
        frequency: 'Mensal',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };
      
      vi.mocked(createPlan).mockReturnValue(mockCreatedPlan);
      
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      // Fill required fields
      await user.type(screen.getByLabelText(/Nome do Plano/), 'Test Plan');
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Mensal'));
      
      const submitButton = screen.getByText('Salvar');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(createPlan).toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalledWith(mockCreatedPlan);
        expect(toast.success).toHaveBeenCalledWith('Plano criado com sucesso.');
      });
    });
  });

  describe('Edit Plan Mode', () => {
    const existingPlan: MaintenancePlan = {
      id: 'plan-1',
      name: 'Existing Plan',
      description: 'Existing Description',
      frequency: 'Trimestral',
      scope: {
        location_id: '1',
        location_name: 'Company 1'
      },
      tasks: [
        {
          id: 'task-1',
          name: 'Task 1',
          checklist: ['Item 1', 'Item 2']
        }
      ],
      status: 'Ativo',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('should render with correct title for edit mode', () => {
      render(<PlanFormModal {...defaultProps} plan={existingPlan} />);
      
      expect(screen.getByText('Editar Plano de Manutenção')).toBeInTheDocument();
    });

    it('should pre-populate form with existing plan data', () => {
      render(<PlanFormModal {...defaultProps} plan={existingPlan} />);
      
      expect(screen.getByDisplayValue('Existing Plan')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    it('should update plan with modified data', async () => {
      const { updatePlan } = await import('@/data/plansStore');
      const mockUpdatedPlan = { ...existingPlan, name: 'Updated Plan' };
      
      vi.mocked(updatePlan).mockReturnValue(mockUpdatedPlan);
      
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} plan={existingPlan} />);
      
      // Modify the name
      const nameInput = screen.getByDisplayValue('Existing Plan');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Plan');
      
      const submitButton = screen.getByText('Atualizar');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(updatePlan).toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalledWith(mockUpdatedPlan);
        expect(toast.success).toHaveBeenCalledWith('Plano atualizado com sucesso.');
      });
    });
  });

  describe('Tasks Management', () => {
    it('should add new task', async () => {
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      const addTaskButton = screen.getByText('Adicionar Tarefa');
      await user.click(addTaskButton);
      
      expect(screen.getByText('Tarefa 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ex: Limpeza de filtros')).toBeInTheDocument();
    });

    it('should remove task', async () => {
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      // Add a task first
      const addTaskButton = screen.getByText('Adicionar Tarefa');
      await user.click(addTaskButton);
      
      // Then remove it
      const removeButton = screen.getByLabelText('Remover tarefa 1');
      await user.click(removeButton);
      
      expect(screen.queryByText('Tarefa 1')).not.toBeInTheDocument();
    });

    it('should validate task names', async () => {
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      // Add required form data
      await user.type(screen.getByLabelText(/Nome do Plano/), 'Test Plan');
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Mensal'));
      
      // Add a task without name
      const addTaskButton = screen.getByText('Adicionar Tarefa');
      await user.click(addTaskButton);
      
      const submitButton = screen.getByText('Salvar');
      await user.click(submitButton);
      
      expect(screen.getByText('Nome da tarefa é obrigatório')).toBeInTheDocument();
    });
  });

  describe('Checklist Management', () => {
    it('should add checklist items', async () => {
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      // Add a task first
      const addTaskButton = screen.getByText('Adicionar Tarefa');
      await user.click(addTaskButton);
      
      // Add checklist item
      const addItemButton = screen.getByText('Adicionar Item');
      await user.click(addItemButton);
      
      expect(screen.getByPlaceholderText('Item do checklist')).toBeInTheDocument();
    });

    it('should remove checklist items', async () => {
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      // Add a task first
      const addTaskButton = screen.getByText('Adicionar Tarefa');
      await user.click(addTaskButton);
      
      // Add checklist item
      const addItemButton = screen.getByText('Adicionar Item');
      await user.click(addItemButton);
      
      // Fill the item
      const itemInput = screen.getByPlaceholderText('Item do checklist');
      await user.type(itemInput, 'Test Item');
      
      // Remove the item
      const removeItemButton = screen.getByLabelText('Remover item 1 do checklist');
      await user.click(removeItemButton);
      
      expect(screen.queryByDisplayValue('Test Item')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should focus on modal title when opened', () => {
      render(<PlanFormModal {...defaultProps} />);
      
      const title = screen.getByText('Novo Plano de Manutenção');
      expect(title).toHaveFocus();
    });

    it('should have proper ARIA labels for action buttons', () => {
      const existingPlan: MaintenancePlan = {
        id: 'plan-1',
        name: 'Test Plan',
        frequency: 'Mensal',
        scope: {},
        tasks: [{ id: 'task-1', name: 'Task 1' }],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      render(<PlanFormModal {...defaultProps} plan={existingPlan} />);
      
      expect(screen.getByLabelText('Remover tarefa 1')).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      render(<PlanFormModal {...defaultProps} />);
      
      const submitButton = screen.getByText('Salvar');
      await user.click(submitButton);
      
      const nameInput = screen.getByLabelText(/Nome do Plano/);
      const errorMessage = screen.getByText('Nome é obrigatório');
      
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      expect(errorMessage).toHaveAttribute('id', 'name-error');
    });
  });
});