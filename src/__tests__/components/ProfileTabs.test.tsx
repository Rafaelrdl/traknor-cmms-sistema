import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileTabs } from '@/components/profile/ProfileTabs';

describe('ProfileTabs', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it('should render all tabs with correct roles and attributes', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    // Verificar se a navegação tem role="tablist"
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute('aria-label', 'Configurações do perfil');

    // Verificar se todos os tabs estão presentes
    const dadosTab = screen.getByRole('tab', { name: /dados/i });
    const preferenciasTab = screen.getByRole('tab', { name: /preferências/i });
    const segurancaTab = screen.getByRole('tab', { name: /segurança/i });

    expect(dadosTab).toBeInTheDocument();
    expect(preferenciasTab).toBeInTheDocument();
    expect(segurancaTab).toBeInTheDocument();
  });

  it('should have correct aria-selected for active tab', () => {
    render(
      <ProfileTabs activeTab="preferencias" onTabChange={mockOnTabChange} />
    );

    const dadosTab = screen.getByRole('tab', { name: /dados/i });
    const preferenciasTab = screen.getByRole('tab', { name: /preferências/i });
    const segurancaTab = screen.getByRole('tab', { name: /segurança/i });

    expect(dadosTab).toHaveAttribute('aria-selected', 'false');
    expect(preferenciasTab).toHaveAttribute('aria-selected', 'true');
    expect(segurancaTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should have correct tabIndex for keyboard navigation', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    const dadosTab = screen.getByRole('tab', { name: /dados/i });
    const preferenciasTab = screen.getByRole('tab', { name: /preferências/i });
    const segurancaTab = screen.getByRole('tab', { name: /segurança/i });

    // Apenas o tab ativo deve ter tabIndex 0
    expect(dadosTab).toHaveAttribute('tabIndex', '0');
    expect(preferenciasTab).toHaveAttribute('tabIndex', '-1');
    expect(segurancaTab).toHaveAttribute('tabIndex', '-1');
  });

  it('should call onTabChange when tab is clicked', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    const preferenciasTab = screen.getByRole('tab', { name: /preferências/i });
    
    fireEvent.click(preferenciasTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('preferencias');
  });

  it('should navigate tabs with arrow keys', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    const dadosTab = screen.getByRole('tab', { name: /dados/i });

    // Testar navegação com seta direita
    fireEvent.keyDown(dadosTab, { key: 'ArrowRight' });
    expect(mockOnTabChange).toHaveBeenCalledWith('preferencias');

    mockOnTabChange.mockClear();

    // Testar navegação com seta esquerda (deve ir para o último tab)
    fireEvent.keyDown(dadosTab, { key: 'ArrowLeft' });
    expect(mockOnTabChange).toHaveBeenCalledWith('seguranca');
  });

  it('should navigate to first tab with Home key', () => {
    render(
      <ProfileTabs activeTab="seguranca" onTabChange={mockOnTabChange} />
    );

    const segurancaTab = screen.getByRole('tab', { name: /segurança/i });

    fireEvent.keyDown(segurancaTab, { key: 'Home' });
    expect(mockOnTabChange).toHaveBeenCalledWith('dados');
  });

  it('should navigate to last tab with End key', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    const dadosTab = screen.getByRole('tab', { name: /dados/i });

    fireEvent.keyDown(dadosTab, { key: 'End' });
    expect(mockOnTabChange).toHaveBeenCalledWith('seguranca');
  });

  it('should prevent default behavior for navigation keys', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    const dadosTab = screen.getByRole('tab', { name: /dados/i });
    const mockPreventDefault = jest.fn();

    // Mock do evento
    const mockEvent = {
      key: 'ArrowRight',
      preventDefault: mockPreventDefault,
    } as any;

    fireEvent.keyDown(dadosTab, mockEvent);

    expect(mockPreventDefault).toHaveBeenCalled();
  });

  it('should have aria-controls attribute pointing to correct panel', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    const dadosTab = screen.getByRole('tab', { name: /dados/i });
    const preferenciasTab = screen.getByRole('tab', { name: /preferências/i });
    const segurancaTab = screen.getByRole('tab', { name: /segurança/i });

    expect(dadosTab).toHaveAttribute('aria-controls', 'panel-dados');
    expect(preferenciasTab).toHaveAttribute('aria-controls', 'panel-preferencias');
    expect(segurancaTab).toHaveAttribute('aria-controls', 'panel-seguranca');
  });

  it('should have correct visual styling for active tab', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    const dadosTab = screen.getByRole('tab', { name: /dados/i });
    const preferenciasTab = screen.getByRole('tab', { name: /preferências/i });

    // O tab ativo deve ter classes de estilo primário
    expect(dadosTab).toHaveClass('border-primary', 'text-primary');
    
    // O tab inativo deve ter classes de estilo muted
    expect(preferenciasTab).toHaveClass('border-transparent', 'text-muted-foreground');
  });

  it('should render icons for each tab', () => {
    render(
      <ProfileTabs activeTab="dados" onTabChange={mockOnTabChange} />
    );

    // Verificar se os ícones estão presentes (assumindo que têm SVG)
    const icons = screen.getAllByRole('img', { hidden: true }); // SVG icons são hidden por padrão
    expect(icons.length).toBeGreaterThanOrEqual(3); // Pelo menos um ícone por tab
  });
});