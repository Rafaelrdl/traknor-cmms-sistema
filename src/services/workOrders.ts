import { api } from '@/lib/apiClient';
import type { 
  WorkOrder, 
  CreateWorkOrderRequest, 
  PaginatedResponse
} from '@/types/api';

export const workOrderService = {
  // List all work orders with pagination
  async listWorkOrders(page = 1, pageSize = 20): Promise<PaginatedResponse<WorkOrder>> {
    const { data } = await api.get<PaginatedResponse<WorkOrder>>('/work-orders/', {
      params: { page, page_size: pageSize }
    });
    return data;
  },

  // Get single work order by ID
  async getWorkOrder(id: number): Promise<WorkOrder> {
    const { data } = await api.get<WorkOrder>(`/work-orders/${id}/`);
    return data;
  },

  // Create new work order
  async createWorkOrder(payload: CreateWorkOrderRequest): Promise<WorkOrder> {
    const { data } = await api.post<WorkOrder>('/work-orders/', payload);
    return data;
  },

  // Update work order
  async updateWorkOrder(id: number, payload: Partial<CreateWorkOrderRequest>): Promise<WorkOrder> {
    const { data } = await api.patch<WorkOrder>(`/work-orders/${id}/`, payload);
    return data;
  },

  // Delete work order
  async deleteWorkOrder(id: number): Promise<void> {
    await api.delete(`/work-orders/${id}/`);
  },

  // Update work order status
  async updateStatus(id: number, status: WorkOrder['status']): Promise<WorkOrder> {
    const { data } = await api.patch<WorkOrder>(`/work-orders/${id}/`, { status });
    return data;
  },
};
