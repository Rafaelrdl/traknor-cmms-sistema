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
  cnpj: string;
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
}

export interface Equipment {
  id: string;
  tag: string;
  model: string;
  brand: string;
  type: 'SPLIT' | 'CENTRAL' | 'VRF' | 'CHILLER';
  capacity: number;
  sectorId: string;
  installDate: string;
  nextMaintenance: string;
  status: 'FUNCTIONING' | 'MAINTENANCE' | 'STOPPED';
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
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  completedAt?: string;
}

export interface ChecklistItem {
  id: string;
  question: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'MULTIPLE_CHOICE';
  options?: string[];
  required: boolean;
  response?: string | number | boolean;
  observations?: string;
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