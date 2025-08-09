import { describe, it, expect } from 'vitest';
import { listCategories, listProcedures } from '@/data/proceduresStore';

describe('ProceduresStore', () => {
  it('should load categories', () => {
    const categories = listCategories();
    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
  });

  it('should load procedures', () => {
    const procedures = listProcedures();
    expect(procedures).toBeDefined();
    expect(Array.isArray(procedures)).toBe(true);
  });
});