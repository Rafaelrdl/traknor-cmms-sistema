import type { 
  User, 
  Company, 
  Equipment, 
  WorkOrder, 
  MaintenancePlan, 
  DashboardKPIs 
} from '@/types';

// API Configuration
const API_BASE_URL = 'http://localhost:3333/api';

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Auth types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage
    this.token = localStorage.getItem('auth:token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth:token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth:token');
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  // Companies endpoints
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    return this.request<Company[]>('/companies');
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return this.request<Company>(`/companies/${id}`);
  }

  // Users endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }

  // Equipment endpoints
  async getEquipment(companyId?: string): Promise<ApiResponse<Equipment[]>> {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request<Equipment[]>(`/equipment${params}`);
  }

  async getEquipmentById(id: string): Promise<ApiResponse<Equipment>> {
    return this.request<Equipment>(`/equipment/${id}`);
  }

  // Work Orders endpoints
  async getWorkOrders(companyId?: string): Promise<ApiResponse<WorkOrder[]>> {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request<WorkOrder[]>(`/work-orders${params}`);
  }

  async getWorkOrder(id: string): Promise<ApiResponse<WorkOrder>> {
    return this.request<WorkOrder>(`/work-orders/${id}`);
  }

  async createWorkOrder(workOrder: Partial<WorkOrder>): Promise<ApiResponse<WorkOrder>> {
    return this.request<WorkOrder>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(workOrder),
    });
  }

  async updateWorkOrder(id: string, workOrder: Partial<WorkOrder>): Promise<ApiResponse<WorkOrder>> {
    return this.request<WorkOrder>(`/work-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workOrder),
    });
  }

  // Maintenance Plans endpoints
  async getMaintenancePlans(companyId?: string): Promise<ApiResponse<MaintenancePlan[]>> {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request<MaintenancePlan[]>(`/plans${params}`);
  }

  async getMaintenancePlan(id: string): Promise<ApiResponse<MaintenancePlan>> {
    return this.request<MaintenancePlan>(`/plans/${id}`);
  }

  // Dashboard/Metrics endpoints
  async getDashboardSummary(): Promise<ApiResponse<any>> {
    return this.request<any>('/metrics/summary');
  }

  async getKPIs(companyId?: string): Promise<ApiResponse<DashboardKPIs>> {
    const params = companyId ? `?company_id=${companyId}` : '';
    return this.request<DashboardKPIs>(`/metrics/kpis${params}`);
  }
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL);

// Export for use in hooks
export default api;
