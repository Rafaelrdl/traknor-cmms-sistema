/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DonutChart } from '../components/charts/DonutChart';

describe('DonutChart', () => {
  const mockData = [
    { label: 'Categoria A', value: 10, color: '#ff0000' },
    { label: 'Categoria B', value: 20, color: '#00ff00' },
    { label: 'Categoria C', value: 15, color: '#0000ff' }
  ];

  it('should render SVG with correct attributes', () => {
    render(<DonutChart data={mockData} srDescriptionId="test-desc" />);
    
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-describedby', 'test-desc');
  });

  it('should render all segments', () => {
    render(<DonutChart data={mockData} srDescriptionId="test-desc" />);
    
    const circles = screen.getByRole('img').querySelectorAll('circle');
    expect(circles).toHaveLength(3); // One for each data item
  });

  it('should render legend with correct data', () => {
    render(<DonutChart data={mockData} srDescriptionId="test-desc" />);
    
    // Check legend items
    expect(screen.getByText('Categoria A')).toBeInTheDocument();
    expect(screen.getByText('Categoria B')).toBeInTheDocument();
    expect(screen.getByText('Categoria C')).toBeInTheDocument();
    
    // Check percentages (22.2%, 44.4%, 33.3% respectively for values 10, 20, 15)
    expect(screen.getByText('22.2%')).toBeInTheDocument();
    expect(screen.getByText('44.4%')).toBeInTheDocument();
    expect(screen.getByText('33.3%')).toBeInTheDocument();
  });

  it('should render screen reader description', () => {
    render(<DonutChart data={mockData} srDescriptionId="test-desc" />);
    
    const description = screen.getByText(/Gráfico de rosca mostrando distribuição/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('id', 'test-desc');
    expect(description).toHaveClass('sr-only');
  });

  it('should render empty state when no data', () => {
    render(<DonutChart data={[]} srDescriptionId="test-desc" />);
    
    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render empty state when total value is zero', () => {
    const zeroData = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 }
    ];
    
    render(<DonutChart data={zeroData} srDescriptionId="test-desc" />);
    
    expect(screen.getByText('Sem dados')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(
      <DonutChart 
        data={mockData} 
        srDescriptionId="test-desc" 
        title="Test Chart Title"
      />
    );
    
    expect(screen.getByText('Test Chart Title')).toBeInTheDocument();
  });

  it('should render center text when provided', () => {
    render(
      <DonutChart 
        data={mockData} 
        srDescriptionId="test-desc" 
        centerText="Total: 45"
      />
    );
    
    expect(screen.getByText('Total: 45')).toBeInTheDocument();
  });

  it('should use default colors when not provided', () => {
    const dataWithoutColors = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 }
    ];
    
    render(<DonutChart data={dataWithoutColors} srDescriptionId="test-desc" />);
    
    const svg = screen.getByRole('img');
    const circles = svg.querySelectorAll('circle');
    
    // Check that circles have stroke attributes (colors)
    circles.forEach(circle => {
      expect(circle).toHaveAttribute('stroke');
      expect(circle.getAttribute('stroke')).not.toBe('');
    });
  });

  it('should have correct SVG dimensions', () => {
    const customSize = 300;
    render(
      <DonutChart 
        data={mockData} 
        srDescriptionId="test-desc" 
        size={customSize}
      />
    );
    
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('width', customSize.toString());
    expect(svg).toHaveAttribute('height', customSize.toString());
  });

  it('should have hover effects on segments', () => {
    render(<DonutChart data={mockData} srDescriptionId="test-desc" />);
    
    const svg = screen.getByRole('img');
    const circles = svg.querySelectorAll('circle');
    
    circles.forEach(circle => {
      expect(circle).toHaveClass('donut-segment');
      expect(circle).toHaveClass('transition-all');
      expect(circle).toHaveClass('hover:brightness-110');
      expect(circle).toHaveClass('cursor-pointer');
    });
  });

  it('should include tooltips for accessibility', () => {
    render(<DonutChart data={mockData} srDescriptionId="test-desc" />);
    
    const svg = screen.getByRole('img');
    const titles = svg.querySelectorAll('title');
    
    expect(titles).toHaveLength(3);
    expect(titles[0]).toHaveTextContent('Categoria A: 10 (22.2%)');
    expect(titles[1]).toHaveTextContent('Categoria B: 20 (44.4%)');
    expect(titles[2]).toHaveTextContent('Categoria C: 15 (33.3%)');
  });

  it('should handle single data point', () => {
    const singleData = [{ label: 'Only Item', value: 100 }];
    
    render(<DonutChart data={singleData} srDescriptionId="test-desc" />);
    
    expect(screen.getByText('Only Item')).toBeInTheDocument();
    expect(screen.getByText('100.0%')).toBeInTheDocument();
    
    const svg = screen.getByRole('img');
    const circles = svg.querySelectorAll('circle');
    expect(circles).toHaveLength(1);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <DonutChart 
        data={mockData} 
        srDescriptionId="test-desc" 
        className="custom-chart-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-chart-class');
  });

  it('should handle decimal values correctly', () => {
    const decimalData = [
      { label: 'A', value: 1.5 },
      { label: 'B', value: 2.3 },
      { label: 'C', value: 0.7 }
    ];
    
    render(<DonutChart data={decimalData} srDescriptionId="test-desc" />);
    
    // Total is 4.5, so percentages should be 33.3%, 51.1%, 15.6%
    expect(screen.getByText('33.3%')).toBeInTheDocument();
    expect(screen.getByText('51.1%')).toBeInTheDocument();
    expect(screen.getByText('15.6%')).toBeInTheDocument();
  });
});