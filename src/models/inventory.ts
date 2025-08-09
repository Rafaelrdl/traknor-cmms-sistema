export type MovementType = 'entrada' | 'saida';

  name: string;
  parent_id?:
  name: string;
  color?: string;
  parent_id?: string | null;
}

  reorder_point: number;
  max_qty?: n
  active: boole
  updated_at: s
}
export interface InventoryMovement {
  item_id: string;
  qty: number;
  note?: string;
  reorder_point: number;
}
export interface Co
  category_name: stri
}
export type AnalysisR


}

export interface InventoryMovement {

  item_id: string;

  qty: number;

  note?: string;

  reference_id?: string;
  unit_cost?: number;
}

export interface ConsumptionByCategory {
  category_id: string;
  category_name: string;
  total_consumed: number;
}

export type AnalysisRange = '30d' | '90d' | '12m';