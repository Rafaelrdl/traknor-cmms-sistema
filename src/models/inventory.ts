export type MovementType = 'entrada' | 'saida';

export interface InventoryCategory {
  id: string;
  name: string;
  parent_id?: string | null;
  color?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  current_qty: number;
  min_qty: number;
  reorder_point: number;
  max_qty?: number;
  unit: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: MovementType;
  qty: number;
  note?: string;
  reference_id?: string;
  unit_cost?: number;
  created_at: string;
  created_by: string;
}

export interface ConsumptionByCategory {
  category_id: string;
  category_name: string;
  total_consumed: number;
}

export type AnalysisRange = '30d' | '90d' | '12m';