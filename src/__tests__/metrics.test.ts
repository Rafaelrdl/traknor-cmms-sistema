import { describe, it, expect } from 'vitest';
import { computeMetrics } from '@/data/metricsStore';

describe('MetricsStore', () => {
  it('should compute MTTR correctly', () => {
    const result = computeMetrics('30d');
    
    expect(result).toHaveProperty('kpis');
    expect(result.kpis).toHaveProperty('mttr_hours');
    expect(typeof result.kpis.mttr_hours).toBe('number');
    expect(result.kpis.mttr_hours).toBeGreaterThanOrEqual(0);
  });

  it('should compute backlog percent correctly', () => {
    const result = computeMetrics('90d');
    
    expect(result.kpis).toHaveProperty('backlog_percent');
    expect(typeof result.kpis.backlog_percent).toBe('number');
    expect(result.kpis.backlog_percent).toBeGreaterThanOrEqual(0);
    expect(result.kpis.backlog_percent).toBeLessThanOrEqual(100);
  });

  it('should provide MTTR by sector data', () => {
    const result = computeMetrics('90d');
    
    expect(result.charts).toHaveProperty('mttr_by_sector');
    expect(Array.isArray(result.charts.mttr_by_sector)).toBe(true);
    
    if (result.charts.mttr_by_sector.length > 0) {
      const firstSector = result.charts.mttr_by_sector[0];
      expect(firstSector).toHaveProperty('sector_name');
      expect(firstSector).toHaveProperty('mttr_hours');
      expect(firstSector).toHaveProperty('wo_count');
    }
  });

  it('should provide backlog trends data', () => {
    const result = computeMetrics('12m');
    
    expect(result.charts).toHaveProperty('backlog_percent_monthly');
    expect(Array.isArray(result.charts.backlog_percent_monthly)).toBe(true);
    
    if (result.charts.backlog_percent_monthly.length > 0) {
      const firstTrend = result.charts.backlog_percent_monthly[0];
      expect(firstTrend).toHaveProperty('month');
      expect(firstTrend).toHaveProperty('backlog_percent');
      expect(firstTrend).toHaveProperty('total_os');
      expect(firstTrend).toHaveProperty('open_os');
    }
  });

  it('should respect range filters', () => {
    const result30d = computeMetrics('30d');
    const result90d = computeMetrics('90d');
    const result12m = computeMetrics('12m');
    
    expect(result30d.range).toBe('30d');
    expect(result90d.range).toBe('90d');
    expect(result12m.range).toBe('12m');
    
    // 12 month range should typically have more trend data points
    expect(result12m.charts.backlog_percent_monthly.length)
      .toBeGreaterThanOrEqual(result90d.charts.backlog_percent_monthly.length);
  });

  it('should handle top asset by work orders', () => {
    const result = computeMetrics('90d');
    
    expect(result.kpis).toHaveProperty('top_asset_by_os');
    
    if (result.kpis.top_asset_by_os) {
      expect(result.kpis.top_asset_by_os).toHaveProperty('asset_id');
      expect(result.kpis.top_asset_by_os).toHaveProperty('asset_name');
      expect(result.kpis.top_asset_by_os).toHaveProperty('count');
      expect(result.kpis.top_asset_by_os.count).toBeGreaterThan(0);
    }
  });

  it('should calculate preventive on-time percentage', () => {
    const result = computeMetrics('90d');
    
    expect(result.kpis).toHaveProperty('preventive_on_time_percent');
    expect(typeof result.kpis.preventive_on_time_percent).toBe('number');
    expect(result.kpis.preventive_on_time_percent).toBeGreaterThanOrEqual(0);
    expect(result.kpis.preventive_on_time_percent).toBeLessThanOrEqual(100);
  });
});