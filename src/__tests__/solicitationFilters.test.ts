import { describe, it, expect } from 'vitest';
import { filterSolicitations, getFilterOptions } from '@/utils/solicitationFilters';
import type { Solicitation } from '@/types';

// Mock data for testing
const mockSolicitations: Solicitation[] = [
  {
    id: '1',
    location_id: 'loc1',
    location_name: 'Building A',
    equipment_id: 'eq1',
    equipment_name: 'AC Unit 1',
    requester_user_id: 'user1',
    requester_user_name: 'John Doe',
    status: 'Nova',
    note: 'Cooling issue',
    status_history: [],
    items: [],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    location_id: 'loc2',
    location_name: 'Building B',
    equipment_id: 'eq2',
    equipment_name: 'AC Unit 2',
    requester_user_id: 'user2',
    requester_user_name: 'Jane Smith',
    status: 'Em triagem',
    note: 'Heating problem',
    status_history: [],
    items: [],
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    location_id: 'loc1',
    location_name: 'Building A',
    equipment_id: 'eq3',
    equipment_name: 'AC Unit 3',
    requester_user_id: 'user1',
    requester_user_name: 'John Doe',
    status: 'Convertida em OS',
    note: 'Maintenance needed',
    status_history: [],
    items: [],
    created_at: '2024-01-25T09:15:00Z',
    updated_at: '2024-01-25T09:15:00Z'
  }
];

describe('solicitationFilters', () => {
  describe('filterSolicitations', () => {
    it('should return all solicitations when no filters applied', () => {
      const result = filterSolicitations(mockSolicitations, {});
      expect(result).toEqual(mockSolicitations);
      expect(result).toHaveLength(3);
    });

    it('should filter by status correctly', () => {
      const filters = { status: ['Nova', 'Em triagem'] };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.status)).toEqual(['Nova', 'Em triagem']);
    });

    it('should filter by single status', () => {
      const filters = { status: ['Nova'] };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('Nova');
    });

    it('should filter by equipment correctly', () => {
      const filters = { equipment: 'eq1' };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(1);
      expect(result[0].equipment_id).toBe('eq1');
    });

    it('should filter by location correctly', () => {
      const filters = { location: 'loc1' };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(2);
      expect(result.every(s => s.location_id === 'loc1')).toBe(true);
    });

    it('should filter by requester correctly', () => {
      const filters = { requester: 'user1' };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(2);
      expect(result.every(s => s.requester_user_id === 'user1')).toBe(true);
    });

    it('should filter by date range correctly', () => {
      const filters = {
        dateRange: {
          from: new Date('2024-01-18'),
          to: new Date('2024-01-22')
        }
      };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter by date from only', () => {
      const filters = {
        dateRange: {
          from: new Date('2024-01-20')
        }
      };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toEqual(['2', '3']);
    });

    it('should filter by date to only', () => {
      const filters = {
        dateRange: {
          to: new Date('2024-01-20')
        }
      };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toEqual(['1', '2']);
    });

    it('should combine multiple filters', () => {
      const filters = {
        status: ['Nova', 'Convertida em OS'],
        location: 'loc1'
      };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(2);
      expect(result.every(s => s.location_id === 'loc1')).toBe(true);
      expect(result.every(s => ['Nova', 'Convertida em OS'].includes(s.status))).toBe(true);
    });

    it('should return empty array when no matches', () => {
      const filters = { status: ['Em triagem'], equipment: 'eq1' };
      const result = filterSolicitations(mockSolicitations, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe('getFilterOptions', () => {
    it('should extract unique equipment options', () => {
      const result = getFilterOptions(mockSolicitations);
      expect(result.equipmentOptions).toHaveLength(3);
      expect(result.equipmentOptions.map(e => e.name)).toEqual([
        'AC Unit 1',
        'AC Unit 2', 
        'AC Unit 3'
      ]);
    });

    it('should extract unique location options', () => {
      const result = getFilterOptions(mockSolicitations);
      expect(result.locationOptions).toHaveLength(2);
      expect(result.locationOptions.map(l => l.name)).toEqual([
        'Building A',
        'Building B'
      ]);
    });

    it('should extract unique requester options', () => {
      const result = getFilterOptions(mockSolicitations);
      expect(result.requesterOptions).toHaveLength(2);
      expect(result.requesterOptions.map(r => r.name)).toEqual([
        'Jane Smith',
        'John Doe'
      ]);
    });

    it('should sort options alphabetically', () => {
      const result = getFilterOptions(mockSolicitations);
      const equipmentNames = result.equipmentOptions.map(e => e.name);
      const sortedNames = [...equipmentNames].sort();
      expect(equipmentNames).toEqual(sortedNames);
    });
  });
});