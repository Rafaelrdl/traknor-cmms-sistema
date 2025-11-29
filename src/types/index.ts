export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN';
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  segment: string;
  cnpj: string;
  address: {
    zip: string;
    city: string;
    state: string;
    fullAddress: string;
  };
  responsible: string;
  role: string;
  phone: string;
  email: string;
  totalArea: number;
  occupants: number;
  hvacUnits: number;
  notes?: string;
  createdAt: string;
}

export interface Sector {
  id: string;
  name: string;
  companyId: string;
  responsible: string;
  phone: string;
  email: string;
  area: number;
  occupants: number;
  hvacUnits: number;
  notes?: string;
}

export interface SubSection {
  id: string;
  name: string;
  sectorId: string;
  responsible: string;
  phone: string;
  email: string;
  area: number;
  occupants: number;
  hvacUnits: number;
  notes?: string;
}

export interface Equipment {
  id: string;
  tag: string;
  model: string;
  brand: string;
  type: 'SPLIT' | 'CENTRAL' | 'VRF' | 'CHILLER';
  capacity: number;
  sectorId?: string;
  subSectionId?: string;
  installDate: string;
  nextMaintenance: string;
  status: 'FUNCTIONING' | 'MAINTENANCE' | 'STOPPED';
  criticidade: 'BAIXA' | 'MEDIA' | 'ALTA';
  lastMaintenance?: string;
  totalOperatingHours?: number;
  energyConsumption?: number;
  warrantyExpiry?: string;
  serialNumber?: string;
  location?: string;
  notes?: string;
}

export interface LocationNode {
  id: string;
  name: string;
  type: 'company' | 'sector' | 'subsection';
  parentId?: string;
  children?: LocationNode[];
  data: Company | Sector | SubSection;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  description: string;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  isActive: boolean;
}

export interface WorkOrder {
  id: string;
  number: string;
  equipmentId: string;
  type: 'PREVENTIVE' | 'CORRECTIVE';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  scheduledDate: string;
  assignedTo?: string;
  assignedToName?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  stockItems?: WorkOrderStockItem[];
  executionDescription?: string;
  photos?: UploadedPhoto[];
  checklistResponses?: ChecklistResponse[];
}

export interface WorkOrderStockItem {
  id: string;
  workOrderId: string;
  stockItemId: string;
  quantity: number;
  stockItem?: StockItem;
}

export type WorkOrderView = 'list' | 'kanban' | 'panel';

export interface ChecklistItem {
  id: string;
  question: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'MULTIPLE_CHOICE';
  options?: string[];
  required: boolean;
  response?: string | number | boolean;
  observations?: string;
}

export interface ChecklistResponse {
  taskId: string;
  taskName: string;
  completed: boolean;
  observations?: string;
  checkItems?: {
    id: string;
    description: string;
    checked: boolean;
  }[];
}

export interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface StockItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  minimum: number;
  maximum: number;
}

export interface DashboardKPIs {
  openWorkOrders: number;
  overdueWorkOrders: number;
  criticalEquipment: number;
  mttr: number; // hours
  mtbf: number; // hours
}

export interface TechnicianPerformance {
  name: string;
  preventive: number;
  corrective: number;
  request: number;
}

export interface MaintenanceHistory {
  id: string;
  equipmentId: string;
  workOrderId: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
  performedBy: string;
  date: string;
  description: string;
  partsUsed: string[];
  cost: number;
  duration: number; // hours
  status: 'COMPLETED' | 'PARTIAL' | 'CANCELLED';
  findings?: string;
  recommendations?: string;
}

export interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  type: 'OVERDUE' | 'UPCOMING' | 'CRITICAL' | 'WARRANTY_EXPIRY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  dueDate: string;
  daysOverdue?: number;
  isAcknowledged: boolean;
  createdAt: string;
}

export interface EquipmentFilter {
  search?: string;
  type?: Equipment['type'][];
  status?: Equipment['status'][];
  brand?: string[];
  location?: string[];
  maintenanceDue?: 'all' | 'upcoming' | 'overdue';
  capacity?: {
    min?: number;
    max?: number;
  };
  installDate?: {
    from?: string;
    to?: string;
  };
}

export interface AssetUtilization {
  equipmentId: string;
  avgOperatingHours: number;
  utilizationRate: number; // percentage
  energyConsumption: number; // kWh
  maintenanceCosts: number;
  downtimeHours: number;
  efficiency: number; // percentage
  lastUpdated: string;
}

export interface LocationCostAnalysis {
  locationId: string;
  locationName: string;
  locationType: 'company' | 'sector' | 'subsection';
  locationPath: string;
  totalEquipment: number;
  totalMaintenanceCosts: number;
  avgCostPerEquipment: number;
  preventiveCosts: number;
  correctiveCosts: number;
  emergencyCosts: number;
  energyCosts: number;
  totalDowntimeHours: number;
  costTrends: {
    period: string;
    cost: number;
  }[];
}

export type SolicitationStatus = 'Nova' | 'Em triagem' | 'Convertida em OS';

export interface SolicitationItem {
  id: string;
  stock_item_id: string;
  stock_item_name: string;
  unit?: string;
  qty: number;
}

export interface SolicitationStatusHistory {
  from?: SolicitationStatus;
  to: SolicitationStatus;
  at: string;
}

export interface Solicitation {
  id: string;
  location_id: string;
  location_name: string;
  equipment_id: string;
  equipment_name: string;
  requester_user_id: string;
  requester_user_name: string;
  note?: string;
  status: SolicitationStatus;
  status_history: SolicitationStatusHistory[];
  items: SolicitationItem[];
  created_at: string;
  updated_at: string;
}

// Re-export inventory types for convenience
export type { 
  InventoryItem, 
  InventoryCategory, 
  InventoryMovement, 
  ConsumptionByCategory, 
  AnalysisRange,
  MovementType 
} from '@/models/inventory';