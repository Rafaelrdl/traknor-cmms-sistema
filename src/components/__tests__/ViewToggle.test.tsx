import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ViewToggle } from '../ViewToggle';

describe('ViewToggle', () => {
  it('renders without crashing', () => {
    const mockOnViewChange = vi.fn();
    
    render(
      <ViewToggle view="list" onViewChange={mockOnViewChange} />
    );
    
    expect(true).toBe(true);
  });
});