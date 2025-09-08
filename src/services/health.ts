import { api } from '@/lib/apiClient';
import type { ApiResponse, HealthStatus, DatabaseHealth } from '@/types/api';

export const healthService = {
  // Check backend health
  async checkHealth(): Promise<HealthStatus> {
    const { data } = await api.get<ApiResponse<HealthStatus>>('/health');
    if (!data.success || !data.data) {
      throw new Error('Health check failed');
    }
    return data.data;
  },

  // Check database health
  async checkDatabaseHealth(): Promise<DatabaseHealth> {
    const { data } = await api.get<ApiResponse<DatabaseHealth>>('/health/db/');
    if (!data.success || !data.data) {
      throw new Error('Database health check failed');
    }
    return data.data;
  },
};
