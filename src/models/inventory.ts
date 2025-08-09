export type MovementType = 'entrada' | 'saida';

export interface InventoryCategory {
  id: string;
  name: string;
  color?: string;
  parent_id?: string | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category_id?: string;
  unit?: 'un' | 'm' | 'kg' | 'L' | string;
  photo_url?: string;
  location_name?: string;
  qty_on_hand: number;
  reorder_point: number;
  min_qty?: number;
  max_qty?: number;
  unit_cost?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_movement_at?: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  type: MovementType;
  qty: number;
  date: string;
  note?: string;
  reference_type?: 'os' | 'solicitation' | 'adjustment';
  reference_id?: string;
  unit_cost?: number;
}

export interface ConsumptionByCategory {
  category_id: string;
  category_name: string;
  total_consumed: number;
}

export type AnalysisRange = '30d' | '90d' | '12m';