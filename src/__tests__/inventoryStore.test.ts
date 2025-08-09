/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  loadItems, 
  loadCategories, 
  loadMovements,
  createItem, 
  updateItem, 
  deleteItem, 
  moveItem,
  searchItems,
  computeConsumptionByCategory
} from '../data/inventoryStore';
import type { InventoryItem, InventoryCategory, InventoryMovement, MovementType } from '../models/inventory';

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

describe('Inventory Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Data Loading', () => {
    it('should load categories from seed data when localStorage is empty', () => {
      const categories = loadCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should load items from seed data when localStorage is empty', () => {
      const items = loadItems();
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should load movements from seed data when localStorage is empty', () => {
      const movements = loadMovements();
      expect(movements).toBeDefined();
      expect(Array.isArray(movements)).toBe(true);
    });
  });

  describe('Item CRUD Operations', () => {
    it('should create a new item with required fields', () => {
      const newItemData = {
        name: 'Test Filter',
        sku: 'TEST-001',
        category_id: '1',
        unit: 'un',
        qty_on_hand: 0,
        reorder_point: 5,
        active: true
      };

      const createdItem = createItem(newItemData);

      expect(createdItem).toMatchObject(newItemData);
      expect(createdItem.id).toBeDefined();
      expect(createdItem.created_at).toBeDefined();
      expect(createdItem.updated_at).toBeDefined();
    });

    it('should update an existing item', () => {
      // First create an item
      const newItemData = {
        name: 'Original Name',
        unit: 'un',
        qty_on_hand: 10,
        reorder_point: 5,
        active: true
      };
      const createdItem = createItem(newItemData);

      // Then update it
      const updatedItem = updateItem({
        ...createdItem,
        name: 'Updated Name',
        reorder_point: 10
      });

      expect(updatedItem.name).toBe('Updated Name');
      expect(updatedItem.reorder_point).toBe(10);
      expect(updatedItem.updated_at).not.toBe(createdItem.updated_at);
    });

    it('should throw error when updating non-existent item', () => {
      const fakeItem = {
        id: 'non-existent',
        name: 'Fake Item',
        unit: 'un',
        qty_on_hand: 0,
        reorder_point: 0,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as InventoryItem;

      expect(() => updateItem(fakeItem)).toThrow('Item with id non-existent not found');
    });

    it('should delete an item', () => {
      const newItemData = {
        name: 'Item to Delete',
        unit: 'un',
        qty_on_hand: 0,
        reorder_point: 0,
        active: true
      };
      const createdItem = createItem(newItemData);

      deleteItem(createdItem.id);

      const items = loadItems();
      expect(items.find(item => item.id === createdItem.id)).toBeUndefined();
    });
  });

  describe('Item Movement', () => {
    let testItem: InventoryItem;

    beforeEach(() => {
      testItem = createItem({
        name: 'Test Item for Movement',
        unit: 'un',
        qty_on_hand: 10,
        reorder_point: 5,
        active: true
      });
    });

    it('should register entrada movement and increase qty_on_hand', () => {
      const movement = moveItem({
        item_id: testItem.id,
        type: 'entrada',
        qty: 5,
        note: 'Test entrada'
      });

      expect(movement.type).toBe('entrada');
      expect(movement.qty).toBe(5);
      expect(movement.item_id).toBe(testItem.id);

      // Check updated item
      const items = loadItems();
      const updatedItem = items.find(item => item.id === testItem.id);
      expect(updatedItem?.qty_on_hand).toBe(15);
    });

    it('should register saida movement and decrease qty_on_hand', () => {
      const movement = moveItem({
        item_id: testItem.id,
        type: 'saida',
        qty: 3,
        note: 'Test saida'
      });

      expect(movement.type).toBe('saida');
      expect(movement.qty).toBe(3);

      // Check updated item
      const items = loadItems();
      const updatedItem = items.find(item => item.id === testItem.id);
      expect(updatedItem?.qty_on_hand).toBe(7);
    });

    it('should prevent saida that results in negative stock', () => {
      expect(() => {
        moveItem({
          item_id: testItem.id,
          type: 'saida',
          qty: 15 // More than available
        });
      }).toThrow('Saldo insuficiente');
    });

    it('should throw error for invalid quantity', () => {
      expect(() => {
        moveItem({
          item_id: testItem.id,
          type: 'entrada',
          qty: 0
        });
      }).toThrow('Quantity must be greater than 0');

      expect(() => {
        moveItem({
          item_id: testItem.id,
          type: 'entrada',
          qty: -5
        });
      }).toThrow('Quantity must be greater than 0');
    });

    it('should throw error for non-existent item', () => {
      expect(() => {
        moveItem({
          item_id: 'non-existent',
          type: 'entrada',
          qty: 5
        });
      }).toThrow('Item with id non-existent not found');
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(() => {
      // Create test items
      createItem({
        name: 'Air Filter G4',
        sku: 'FILTER-001',
        category_id: '1',
        unit: 'un',
        qty_on_hand: 10,
        reorder_point: 5,
        active: true
      });

      createItem({
        name: 'Refrigerant R410A',
        sku: 'REF-002',
        category_id: '2',
        unit: 'kg',
        qty_on_hand: 5,
        reorder_point: 3,
        active: true
      });

      createItem({
        name: 'Inactive Item',
        sku: 'OLD-003',
        category_id: '1',
        unit: 'un',
        qty_on_hand: 0,
        reorder_point: 0,
        active: false
      });
    });

    it('should search items by name', () => {
      const results = searchItems('filter');
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Filter');
    });

    it('should search items by SKU', () => {
      const results = searchItems('REF-002');
      expect(results.length).toBe(1);
      expect(results[0].sku).toBe('REF-002');
    });

    it('should filter by category', () => {
      const results = searchItems('', { category_id: '1' });
      expect(results.length).toBe(2); // Including inactive item
      expect(results.every(item => item.category_id === '1')).toBe(true);
    });

    it('should filter by active status', () => {
      const activeResults = searchItems('', { active: true });
      expect(activeResults.every(item => item.active)).toBe(true);

      const inactiveResults = searchItems('', { active: false });
      expect(inactiveResults.every(item => !item.active)).toBe(true);
    });

    it('should combine search query with filters', () => {
      const results = searchItems('Air', { category_id: '1', active: true });
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Air');
      expect(results[0].category_id).toBe('1');
      expect(results[0].active).toBe(true);
    });
  });

  describe('Consumption Analysis', () => {
    beforeEach(() => {
      // Clear localStorage to start fresh
      localStorageMock.clear();
      
      // Create test items and movements
      const item1 = createItem({
        name: 'Filter Item',
        category_id: '1',
        unit: 'un',
        qty_on_hand: 20,
        reorder_point: 5,
        active: true
      });

      const item2 = createItem({
        name: 'Oil Item',
        category_id: '3',
        unit: 'L',
        qty_on_hand: 10,
        reorder_point: 3,
        active: true
      });

      // Add some movements (saida type for consumption)
      moveItem({
        item_id: item1.id,
        type: 'saida',
        qty: 5,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      });

      moveItem({
        item_id: item2.id,
        type: 'saida',
        qty: 3,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      });
    });

    it('should compute consumption by category for 30d range', () => {
      const consumption = computeConsumptionByCategory('30d');
      expect(Array.isArray(consumption)).toBe(true);
      expect(consumption.length).toBeGreaterThan(0);
      
      const filterCategory = consumption.find(c => c.category_id === '1');
      const oilCategory = consumption.find(c => c.category_id === '3');
      
      expect(filterCategory?.total_consumed).toBe(5);
      expect(oilCategory?.total_consumed).toBe(3);
    });

    it('should only include saida movements in consumption', () => {
      const testItem = createItem({
        name: 'Test Item',
        category_id: '1',
        unit: 'un',
        qty_on_hand: 100,
        reorder_point: 10,
        active: true
      });

      // Add entrada (should not affect consumption)
      moveItem({
        item_id: testItem.id,
        type: 'entrada',
        qty: 20
      });

      // Add saida (should affect consumption)
      moveItem({
        item_id: testItem.id,
        type: 'saida',
        qty: 10
      });

      const consumption = computeConsumptionByCategory('30d');
      const categoryConsumption = consumption.find(c => c.category_id === '1');
      
      // Should only count saida movements, not entrada
      expect(categoryConsumption?.total_consumed).toBeGreaterThanOrEqual(10);
    });

    it('should return empty array when no consumption in range', () => {
      // Clear all movements
      localStorageMock.setItem('inventory:movements', JSON.stringify([]));
      
      const consumption = computeConsumptionByCategory('30d');
      expect(consumption).toEqual([]);
    });
  });
});