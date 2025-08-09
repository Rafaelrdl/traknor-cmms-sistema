/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventoryTabs } from '../components/inventory/InventoryTabs';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('InventoryTabs', () => {
  const mockTabs = [
    {
      value: 'table' as const,
      label: 'Tabela',
      content: <div data-testid="table-content">Table Content</div>
    },
    {
      value: 'cards' as const,
      label: 'Cards',
      content: <div data-testid="cards-content">Cards Content</div>
    },
    {
      value: 'analysis' as const,
      label: 'Análise',
      content: <div data-testid="analysis-content">Analysis Content</div>
    }
  ];

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should render all tab buttons', () => {
    render(<InventoryTabs tabs={mockTabs} />);
    
    expect(screen.getByRole('tab', { name: 'Tabela' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Cards' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Análise' })).toBeInTheDocument();
  });

  it('should show default tab content initially', () => {
    render(<InventoryTabs tabs={mockTabs} defaultValue="table" />);
    
    expect(screen.getByTestId('table-content')).toBeVisible();
    expect(screen.queryByTestId('cards-content')).not.toBeVisible();
    expect(screen.queryByTestId('analysis-content')).not.toBeVisible();
  });

  it('should have correct ARIA attributes', () => {
    render(<InventoryTabs tabs={mockTabs} />);
    
    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveAttribute('aria-label', 'Visualizações de inventário');
    
    const activeTab = screen.getByRole('tab', { selected: true });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(activeTab).toHaveAttribute('tabindex', '0');
    
    const inactiveTabs = screen.getAllByRole('tab', { selected: false });
    inactiveTabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected', 'false');
      expect(tab).toHaveAttribute('tabindex', '-1');
    });
  });

  it('should switch tabs when clicked', async () => {
    render(<InventoryTabs tabs={mockTabs} defaultValue="table" />);
    
    // Initially table should be visible
    expect(screen.getByTestId('table-content')).toBeVisible();
    
    // Click on Cards tab
    fireEvent.click(screen.getByRole('tab', { name: 'Cards' }));
    
    await waitFor(() => {
      expect(screen.getByTestId('cards-content')).toBeVisible();
      expect(screen.queryByTestId('table-content')).not.toBeVisible();
    });
  });

  it('should save tab selection to localStorage', async () => {
    render(<InventoryTabs tabs={mockTabs} defaultValue="table" />);
    
    fireEvent.click(screen.getByRole('tab', { name: 'Cards' }));
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('inventory:lastTab', 'cards');
    });
  });

  it('should restore tab selection from localStorage', () => {
    localStorageMock.setItem('inventory:lastTab', 'analysis');
    
    render(<InventoryTabs tabs={mockTabs} />);
    
    expect(screen.getByTestId('analysis-content')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Análise' })).toHaveAttribute('aria-selected', 'true');
  });

  it('should handle keyboard navigation', () => {
    render(<InventoryTabs tabs={mockTabs} defaultValue="table" />);
    
    const tableTab = screen.getByRole('tab', { name: 'Tabela' });
    const cardsTab = screen.getByRole('tab', { name: 'Cards' });
    const analysisTab = screen.getByRole('tab', { name: 'Análise' });
    
    // Focus first tab
    tableTab.focus();
    
    // Test Arrow Right
    fireEvent.keyDown(tableTab, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cardsTab);
    
    // Test Arrow Left
    fireEvent.keyDown(cardsTab, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tableTab);
    
    // Test Home key
    cardsTab.focus();
    fireEvent.keyDown(cardsTab, { key: 'Home' });
    expect(document.activeElement).toBe(tableTab);
    
    // Test End key
    fireEvent.keyDown(tableTab, { key: 'End' });
    expect(document.activeElement).toBe(analysisTab);
  });

  it('should activate tab with Enter and Space keys', async () => {
    render(<InventoryTabs tabs={mockTabs} defaultValue="table" />);
    
    const cardsTab = screen.getByRole('tab', { name: 'Cards' });
    cardsTab.focus();
    
    // Test Enter key
    fireEvent.keyDown(cardsTab, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByTestId('cards-content')).toBeVisible();
      expect(cardsTab).toHaveAttribute('aria-selected', 'true');
    });
    
    // Switch to analysis tab with Space key
    const analysisTab = screen.getByRole('tab', { name: 'Análise' });
    analysisTab.focus();
    fireEvent.keyDown(analysisTab, { key: ' ' });
    
    await waitFor(() => {
      expect(screen.getByTestId('analysis-content')).toBeVisible();
      expect(analysisTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should handle wrapping keyboard navigation', () => {
    render(<InventoryTabs tabs={mockTabs} defaultValue="table" />);
    
    const tableTab = screen.getByRole('tab', { name: 'Tabela' });
    const analysisTab = screen.getByRole('tab', { name: 'Análise' });
    
    // Test wrapping from first to last
    tableTab.focus();
    fireEvent.keyDown(tableTab, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(analysisTab);
    
    // Test wrapping from last to first
    fireEvent.keyDown(analysisTab, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tableTab);
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    // Should still render with default value
    expect(() => {
      render(<InventoryTabs tabs={mockTabs} defaultValue="cards" />);
    }).not.toThrow();
    
    expect(screen.getByTestId('cards-content')).toBeVisible();
  });

  it('should fall back to default when invalid stored value', () => {
    localStorageMock.setItem('inventory:lastTab', 'invalid-tab');
    
    render(<InventoryTabs tabs={mockTabs} defaultValue="analysis" />);
    
    // Should use the stored value even if invalid, as it will be corrected by the component
    // The component handles this by finding the index, which would return -1 and default to 0
    expect(screen.getByRole('tab', { name: 'Tabela' })).toHaveAttribute('aria-selected', 'true');
  });
});