import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SolicitationsDrawer } from '../SolicitationsDrawer';
import { toast } from 'sonner';
import type { Solicitation, StockItem } from '@/types';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockSolicitation: Solicitation = {
  id: '1',
  location_id: '1',
  location_name: 'Test Location',
  equipment_id: '1',
  equipment_name: 'Test Equipment',
  requester_user_id: '1',
  requester_user_name: 'Test User',
  note: 'Test note for solicitation',
  status: 'Nova',
  status_history: [
    {
      to: 'Nova',
      at: '2024-01-20T08:30:00.000Z'
    }
  ],
  items: [],
  created_at: '2024-01-20T08:30:00.000Z',
  updated_at: '2024-01-20T08:30:00.000Z'
};

const mockStockItems: StockItem[] = [
  {
    id: '1',
    code: 'TEST001',
    description: 'Test Item 1',
    unit: 'un',
    quantity: 10,
    minimum: 1,
    maximum: 100
  },
  {
    id: '2',
    code: 'TEST002',
    description: 'Test Item 2',
    unit: 'kg',
    quantity: 5,
    minimum: 1,
    maximum: 50
  }
];

describe('SolicitationsDrawer', () => {
  const mockProps = {
    solicitation: mockSolicitation,
    isOpen: true,
    onClose: vi.fn(),
    onUpdate: vi.fn(),
    onConvert: vi.fn(),
    stockItems: mockStockItems
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing when open', () => {
    render(<SolicitationsDrawer {...mockProps} />);
    
    expect(screen.getByText('SOL-000001')).toBeInTheDocument();
    expect(screen.getByText('Detalhes e gerenciamento da solicitação')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SolicitationsDrawer {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('SOL-000001')).not.toBeInTheDocument();
  });

  it('does not render when solicitation is null', () => {
    render(<SolicitationsDrawer {...mockProps} solicitation={null} />);
    
    expect(screen.queryByText('SOL-000001')).not.toBeInTheDocument();
  });

  it('displays solicitation information correctly', () => {
    render(<SolicitationsDrawer {...mockProps} />);
    
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test Equipment')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test note for solicitation')).toBeInTheDocument();
    expect(screen.getByText('Nova')).toBeInTheDocument();
  });

  it('shows advance status button for Nova status', () => {
    render(<SolicitationsDrawer {...mockProps} />);
    
    expect(screen.getByText('Iniciar triagem')).toBeInTheDocument();
  });

  it('shows convert to OS button for Em triagem status', () => {
    const solicitationInTriagem = {
      ...mockSolicitation,
      status: 'Em triagem' as const
    };
    
    render(<SolicitationsDrawer {...mockProps} solicitation={solicitationInTriagem} />);
    
    expect(screen.getByText('Converter em OS')).toBeInTheDocument();
  });

  it('does not show action button for Convertida em OS status', () => {
    const convertedSolicitation = {
      ...mockSolicitation,
      status: 'Convertida em OS' as const
    };
    
    render(<SolicitationsDrawer {...mockProps} solicitation={convertedSolicitation} />);
    
    expect(screen.queryByText('Iniciar triagem')).not.toBeInTheDocument();
    expect(screen.queryByText('Converter em OS')).not.toBeInTheDocument();
  });

  it('displays status history when available', () => {
    const solicitationWithHistory = {
      ...mockSolicitation,
      status: 'Em triagem' as const,
      status_history: [
        {
          to: 'Nova',
          at: '2024-01-20T08:30:00.000Z'
        },
        {
          from: 'Nova',
          to: 'Em triagem',
          at: '2024-01-20T10:30:00.000Z'
        }
      ]
    };
    
    render(<SolicitationsDrawer {...mockProps} solicitation={solicitationWithHistory} />);
    
    expect(screen.getByText('Histórico:')).toBeInTheDocument();
  });

  it('displays items correctly when present', () => {
    const solicitationWithItems = {
      ...mockSolicitation,
      items: [
        {
          id: 'item-1',
          stock_item_id: '1',
          stock_item_name: 'Test Stock Item',
          unit: 'un',
          qty: 3
        }
      ]
    };
    
    render(<SolicitationsDrawer {...mockProps} solicitation={solicitationWithItems} />);
    
    expect(screen.getByText('Test Stock Item')).toBeInTheDocument();
    expect(screen.getByText('3 un')).toBeInTheDocument();
  });

  it('allows adding items when not converted', async () => {
    const user = userEvent.setup();
    render(<SolicitationsDrawer {...mockProps} />);
    
    // Select stock item
    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('Test Item 1 (un)'));
    
    // Enter quantity
    const quantityInput = screen.getByPlaceholderText('Quantidade');
    await user.type(quantityInput, '5');
    
    // Click add button
    const addButton = screen.getByText('Adicionar');
    await user.click(addButton);
    
    expect(mockProps.onUpdate).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Item adicionado.');
  });

  it('validates input when adding items', async () => {
    const user = userEvent.setup();
    render(<SolicitationsDrawer {...mockProps} />);
    
    // Try to add without selecting item or quantity
    const addButton = screen.getByText('Adicionar');
    await user.click(addButton);
    
    expect(toast.error).toHaveBeenCalledWith('Selecione um item e informe uma quantidade válida.');
    expect(mockProps.onUpdate).not.toHaveBeenCalled();
  });

  it('handles escape key to close drawer', async () => {
    render(<SolicitationsDrawer {...mockProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('focuses on title when opened', () => {
    const { rerender } = render(<SolicitationsDrawer {...mockProps} isOpen={false} />);
    
    rerender(<SolicitationsDrawer {...mockProps} isOpen={true} />);
    
    const title = screen.getByText('SOL-000001');
    expect(title).toHaveFocus();
  });

  it('has proper accessibility attributes', () => {
    render(<SolicitationsDrawer {...mockProps} />);
    
    const drawer = screen.getByRole('dialog', { hidden: true });
    expect(drawer).toHaveAttribute('aria-labelledby', 'solicitation-drawer-title');
    expect(drawer).toHaveAttribute('aria-describedby', 'solicitation-drawer-description');
    
    const title = screen.getByText('SOL-000001');
    expect(title).toHaveAttribute('id', 'solicitation-drawer-title');
    expect(title).toHaveAttribute('tabIndex', '-1');
  });

  it('closes drawer when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SolicitationsDrawer {...mockProps} />);
    
    const closeButton = screen.getByText('Fechar');
    await user.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('advances status when advance button is clicked', async () => {
    const user = userEvent.setup();
    render(<SolicitationsDrawer {...mockProps} />);
    
    const advanceButton = screen.getByText('Iniciar triagem');
    await user.click(advanceButton);
    
    expect(mockProps.onUpdate).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Solicitação movida para triagem.');
  });
});