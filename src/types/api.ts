// Basic types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

// Health check types
export interface HealthStatus {
  status: string;
  timestamp: string;
  message: string;
}

export interface DatabaseHealth {
  status: string;
  db_time: string;
  database: string;
  user: string;
  message: string;
}

// Work Order types
export interface WorkOrder {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  equipment?: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
}

export interface CreateWorkOrderRequest {
  title: string;
  description?: string;
  status?: WorkOrder['status'];
  priority?: WorkOrder['priority'];
  assigned_to?: number;
  equipment?: number;
  due_date?: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Pagination types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
