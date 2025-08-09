import { describe, it, expect, vi } from 'vitest';
import {
  canAdvanceStatus,
  getNextStatus,
  advanceSolicitationStatus,
  addSolicitationItem,
  removeSolicitationItem,
  convertSolicitationToWorkOrder
} from '@/hooks/useDataTemp';
import type { Solicitation } from '@/types';

const createMockSolicitation = (status: Solicitation['status']): Solicitation => ({
  id: '1',
  location_id: '1',
  location_name: 'Test Location',
  equipment_id: '1',
  equipment_name: 'Test Equipment',
  requester_user_id: '1',
  requester_user_name: 'Test User',
  note: 'Test note',
  status,
  status_history: [
    {
      to: status,
      at: '2024-01-20T08:30:00.000Z'
    }
  ],
  items: [],
  created_at: '2024-01-20T08:30:00.000Z',
  updated_at: '2024-01-20T08:30:00.000Z'
});

describe('Solicitation Utility Functions', () => {
  describe('canAdvanceStatus', () => {
    it('returns true for Nova status', () => {
      const solicitation = createMockSolicitation('Nova');
      expect(canAdvanceStatus(solicitation)).toBe(true);
    });

    it('returns true for Em triagem status', () => {
      const solicitation = createMockSolicitation('Em triagem');
      expect(canAdvanceStatus(solicitation)).toBe(true);
    });

    it('returns false for Convertida em OS status', () => {
      const solicitation = createMockSolicitation('Convertida em OS');
      expect(canAdvanceStatus(solicitation)).toBe(false);
    });
  });

  describe('getNextStatus', () => {
    it('returns "Em triagem" for Nova status', () => {
      expect(getNextStatus('Nova')).toBe('Em triagem');
    });

    it('returns "Convertida em OS" for Em triagem status', () => {
      expect(getNextStatus('Em triagem')).toBe('Convertida em OS');
    });

    it('returns null for Convertida em OS status', () => {
      expect(getNextStatus('Convertida em OS')).toBe(null);
    });
  });

  describe('advanceSolicitationStatus', () => {
    it('advances status from Nova to Em triagem', () => {
      const solicitation = createMockSolicitation('Nova');
      const result = advanceSolicitationStatus(solicitation);
      
      expect(result).not.toBeNull();
      expect(result!.status).toBe('Em triagem');
      expect(result!.status_history).toHaveLength(2);
      expect(result!.status_history[1].from).toBe('Nova');
      expect(result!.status_history[1].to).toBe('Em triagem');
    });

    it('advances status from Em triagem to Convertida em OS', () => {
      const solicitation = createMockSolicitation('Em triagem');
      const result = advanceSolicitationStatus(solicitation);
      
      expect(result).not.toBeNull();
      expect(result!.status).toBe('Convertida em OS');
      expect(result!.status_history).toHaveLength(2);
      expect(result!.status_history[1].from).toBe('Em triagem');
      expect(result!.status_history[1].to).toBe('Convertida em OS');
    });

    it('returns null for final status', () => {
      const solicitation = createMockSolicitation('Convertida em OS');
      const result = advanceSolicitationStatus(solicitation);
      
      expect(result).toBeNull();
    });

    it('updates the updated_at timestamp', () => {
      const solicitation = createMockSolicitation('Nova');
      const result = advanceSolicitationStatus(solicitation);
      
      expect(result).not.toBeNull();
      expect(result!.updated_at).not.toBe(solicitation.updated_at);
    });
  });

  describe('addSolicitationItem', () => {
    it('adds new item to empty items array', () => {
      const solicitation = createMockSolicitation('Nova');
      const result = addSolicitationItem(
        solicitation,
        'stock-1',
        'Test Stock Item',
        'un',
        5
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].stock_item_id).toBe('stock-1');
      expect(result.items[0].stock_item_name).toBe('Test Stock Item');
      expect(result.items[0].unit).toBe('un');
      expect(result.items[0].qty).toBe(5);
    });

    it('sums quantities when adding existing item', () => {
      const solicitation = createMockSolicitation('Nova');
      solicitation.items = [
        {
          id: '1',
          stock_item_id: 'stock-1',
          stock_item_name: 'Test Stock Item',
          unit: 'un',
          qty: 3
        }
      ];

      const result = addSolicitationItem(
        solicitation,
        'stock-1',
        'Test Stock Item',
        'un',
        5
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].qty).toBe(8); // 3 + 5
    });

    it('updates the updated_at timestamp', () => {
      const solicitation = createMockSolicitation('Nova');
      const result = addSolicitationItem(
        solicitation,
        'stock-1',
        'Test Stock Item',
        'un',
        5
      );

      expect(result.updated_at).not.toBe(solicitation.updated_at);
    });
  });

  describe('removeSolicitationItem', () => {
    it('removes item from items array', () => {
      const solicitation = createMockSolicitation('Nova');
      solicitation.items = [
        {
          id: 'item-1',
          stock_item_id: 'stock-1',
          stock_item_name: 'Test Stock Item',
          unit: 'un',
          qty: 3
        },
        {
          id: 'item-2',
          stock_item_id: 'stock-2',
          stock_item_name: 'Another Item',
          unit: 'kg',
          qty: 2
        }
      ];

      const result = removeSolicitationItem(solicitation, 'item-1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('item-2');
    });

    it('updates the updated_at timestamp', () => {
      const solicitation = createMockSolicitation('Nova');
      solicitation.items = [
        {
          id: 'item-1',
          stock_item_id: 'stock-1',
          stock_item_name: 'Test Stock Item',
          unit: 'un',
          qty: 3
        }
      ];

      const result = removeSolicitationItem(solicitation, 'item-1');

      expect(result.updated_at).not.toBe(solicitation.updated_at);
    });
  });

  describe('convertSolicitationToWorkOrder', () => {
    it('converts solicitation to work order with correct properties', () => {
      const solicitation = createMockSolicitation('Em triagem');
      solicitation.items = [
        {
          id: 'item-1',
          stock_item_id: 'stock-1',
          stock_item_name: 'Test Stock Item',
          unit: 'un',
          qty: 3
        }
      ];

      const result = convertSolicitationToWorkOrder(solicitation);

      expect(result.type).toBe('CORRECTIVE');
      expect(result.status).toBe('OPEN');
      expect(result.priority).toBe('MEDIUM');
      expect(result.equipmentId).toBe(solicitation.equipment_id);
      expect(result.description).toContain(solicitation.note!);
      expect(result.number).toMatch(/^OS-\d{6}$/);
    });

    it('maps solicitation items to work order stock items', () => {
      const solicitation = createMockSolicitation('Em triagem');
      solicitation.items = [
        {
          id: 'item-1',
          stock_item_id: 'stock-1',
          stock_item_name: 'Test Stock Item',
          unit: 'un',
          qty: 3
        },
        {
          id: 'item-2',
          stock_item_id: 'stock-2',
          stock_item_name: 'Another Item',
          unit: 'kg',
          qty: 2
        }
      ];

      const result = convertSolicitationToWorkOrder(solicitation);

      expect(result.stockItems).toHaveLength(2);
      expect(result.stockItems![0].stockItemId).toBe('stock-1');
      expect(result.stockItems![0].quantity).toBe(3);
      expect(result.stockItems![1].stockItemId).toBe('stock-2');
      expect(result.stockItems![1].quantity).toBe(2);
    });

    it('handles solicitation without note', () => {
      const solicitation = createMockSolicitation('Em triagem');
      solicitation.note = undefined;

      const result = convertSolicitationToWorkOrder(solicitation);

      expect(result.description).toBe('Convertida da solicitação: Sem observações');
    });
  });
});