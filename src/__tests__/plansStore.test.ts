import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  loadPlans, 
  savePlans, 
  createPlan, 
  updatePlan, 
  findPlanById,
  deletePlan 
} from '@/data/plansStore';
import type { MaintenancePlan } from '@/models/plan';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('plansStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadPlans', () => {
    it('should return mock data when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const plans = loadPlans();
      
      expect(plans).toHaveLength(3);
      expect(plans[0].name).toBe('Plano Mensal - Climatizadores');
    });

    it('should return stored data when localStorage has plans', () => {
      const storedPlans: MaintenancePlan[] = [{
        id: 'test-1',
        name: 'Test Plan',
        frequency: 'Mensal',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedPlans));
      
      const plans = loadPlans();
      
      expect(plans).toEqual(storedPlans);
    });

    it('should handle JSON parse errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const plans = loadPlans();
      
      // Should fall back to mock data
      expect(plans).toHaveLength(3);
    });
  });

  describe('createPlan', () => {
    it('should create a new plan with generated id and timestamps', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      const planData = {
        name: 'New Plan',
        frequency: 'Mensal' as const,
        scope: {},
        tasks: [],
        status: 'Ativo' as const
      };
      
      const newPlan = createPlan(planData);
      
      expect(newPlan.id).toMatch(/^plan-/);
      expect(newPlan.name).toBe('New Plan');
      expect(newPlan.created_at).toBeTruthy();
      expect(newPlan.updated_at).toBeTruthy();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('updatePlan', () => {
    it('should update an existing plan', () => {
      const existingPlans: MaintenancePlan[] = [{
        id: 'plan-1',
        name: 'Old Name',
        frequency: 'Mensal',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingPlans));
      
      const updatedPlan = updatePlan({
        ...existingPlans[0],
        name: 'New Name'
      });
      
      expect(updatedPlan.name).toBe('New Name');
      expect(updatedPlan.updated_at).not.toBe(existingPlans[0].updated_at);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should throw error when plan not found', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      const nonExistentPlan: MaintenancePlan = {
        id: 'non-existent',
        name: 'Non-existent Plan',
        frequency: 'Mensal',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };
      
      expect(() => updatePlan(nonExistentPlan)).toThrow('Plan with id non-existent not found');
    });
  });

  describe('findPlanById', () => {
    it('should find plan by id', () => {
      const plans: MaintenancePlan[] = [{
        id: 'plan-1',
        name: 'Test Plan',
        frequency: 'Mensal',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(plans));
      
      const foundPlan = findPlanById('plan-1');
      
      expect(foundPlan).toEqual(plans[0]);
    });

    it('should return undefined when plan not found', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      const foundPlan = findPlanById('non-existent');
      
      expect(foundPlan).toBeUndefined();
    });
  });

  describe('deletePlan', () => {
    it('should delete plan and return true', () => {
      const plans: MaintenancePlan[] = [{
        id: 'plan-1',
        name: 'Test Plan',
        frequency: 'Mensal',
        scope: {},
        tasks: [],
        status: 'Ativo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(plans));
      
      const result = deletePlan('plan-1');
      
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'traknor-maintenance-plans',
        '[]'
      );
    });

    it('should return false when plan not found', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      
      const result = deletePlan('non-existent');
      
      expect(result).toBe(false);
    });
  });
});