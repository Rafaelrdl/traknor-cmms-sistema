/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuickStartCard } from '@/components/tour/HelpCenterTour';

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

describe('QuickStartCard', () => {
  const mockOnStartTour = vi.fn();

  beforeEach(() => {
    localStorageMock.clear();
    mockOnStartTour.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    // Clean up any existing event listeners
    vi.clearAllMocks();
  });

  it('renders the quick start card by default when not dismissed', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    expect(screen.getByText('Início Rápido')).toBeDefined();
    expect(screen.getByText('• Assista ao vídeo de introdução')).toBeDefined();
    expect(screen.getByText('• Explore as categorias de conteúdo')).toBeDefined();
    expect(screen.getByText('• Marque artigos como favoritos')).toBeDefined();
    expect(screen.getByText('• Acompanhe seu progresso')).toBeDefined();
  });

  it('does not render when dismissed in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    expect(screen.queryByText('Início Rápido')).toBeNull();
  });

  it('has proper accessibility attributes', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByLabelText('Fechar guia de início rápido')).toBeDefined();
    
    const title = screen.getByText('Início Rápido');
    expect(title.getAttribute('id')).toBe('quickstart-title');
    
    const description = screen.getByText('• Assista ao vídeo de introdução').closest('div');
    expect(description?.getAttribute('id')).toBe('quickstart-description');
  });

  it('closes when X button is clicked but does not persist', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    const closeButton = screen.getByLabelText('Fechar guia de início rápido');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Início Rápido')).toBeNull();
    });
    
    // Should not persist the dismissal when just closing
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('calls onStartTour when "Iniciar Tour" button is clicked', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    const startTourButton = screen.getByText('Iniciar Tour');
    fireEvent.click(startTourButton);
    
    expect(mockOnStartTour).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(screen.queryByText('Início Rápido')).toBeNull();
    });
  });

  it('permanently dismisses when "Não mostrar novamente" is checked', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    const checkbox = screen.getByLabelText('Não mostrar novamente');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('help:quickstart-dismissed', 'true');
      expect(screen.queryByText('Início Rápido')).toBeNull();
    });
  });

  it('closes on Escape key press', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    // Simulate Escape key press
    fireEvent.keyDown(window, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByText('Início Rápido')).toBeNull();
    });
    
    // Should not persist the dismissal when closing with Esc
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('handles localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    // Should still render (default to true when localStorage fails)
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    expect(screen.getByText('Início Rápido')).toBeDefined();
  });

  it('handles localStorage setItem errors gracefully', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage setItem error');
    });
    
    // Mock console.warn to verify it's called
    const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    const checkbox = screen.getByLabelText('Não mostrar novamente');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(consoleMock).toHaveBeenCalledWith('Failed to save quick start preference:', expect.any(Error));
      expect(screen.queryByText('Início Rápido')).toBeNull();
    });
    
    consoleMock.mockRestore();
  });

  it('prevents event propagation on mouse down to avoid outside click issues', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<QuickStartCard onStartTour={mockOnStartTour} />);
    
    const card = screen.getByRole('dialog');
    const stopPropagationSpy = vi.fn();
    
    const event = {
      stopPropagation: stopPropagationSpy,
    } as any;
    
    fireEvent.mouseDown(card, event);
    
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
