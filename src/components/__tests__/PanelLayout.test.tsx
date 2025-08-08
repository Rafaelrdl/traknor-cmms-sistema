import React from 'react';
import { render, screen } from '@testing-library/react';
import { PanelLayout } from '@/components/PanelLayout';

// Mock the useCurrentBreakpoint hook
jest.mock('@/hooks/useBreakpoint', () => ({
  useCurrentBreakpoint: () => 'lg',
}));

describe('PanelLayout', () => {
  it('renders both details and list slots on desktop', () => {
    render(
      <PanelLayout
        detailsSlot={<div data-testid="details">Details Content</div>}
        listSlot={<div data-testid="list">List Content</div>}
      />
    );

    expect(screen.getByTestId('details')).toBeInTheDocument();
    expect(screen.getByTestId('list')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PanelLayout
        detailsSlot={<div>Details</div>}
        listSlot={<div>List</div>}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});