import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { 
  User, 
  Company, 
  Sector, 
  SubSection,
  Equipment, 
  WorkOrder, 
  MaintenancePlan, 
  StockItem,
  DashboardKPIs 
} from '@/types';

// Custom hook for API data fetching
function useApiData<T>(
  fetchFn: () => Promise<{ success: boolean; data: T }>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFn();
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch };
}

// Companies hook
export const useCompanies = (): [Company[], () => void, boolean] => {
  const { data, loading, refetch } = useApiData<Company[]>(() => api.getCompanies());
  return [data || [], refetch, loading];
};

// Users hook  
export const useUsers = (): [User[], () => void, boolean] => {
  const { data, loading, refetch } = useApiData<User[]>(() => api.getUsers());
  return [data || [], refetch, loading];
};

// Equipment hook
export const useEquipment = (companyId?: string): [Equipment[], () => void, boolean] => {
  const { data, loading, refetch } = useApiData<Equipment[]>(
    () => api.getEquipment(companyId),
    [companyId]
  );
  return [data || [], refetch, loading];
};

// Work Orders hook
export const useWorkOrders = (companyId?: string): [WorkOrder[], () => void, boolean] => {
  const { data, loading, refetch } = useApiData<WorkOrder[]>(
    () => api.getWorkOrders(companyId),
    [companyId]
  );
  return [data || [], refetch, loading];
};

// Maintenance Plans hook
export const useMaintenancePlans = (companyId?: string): [MaintenancePlan[], () => void, boolean] => {
  const { data, loading, refetch } = useApiData<MaintenancePlan[]>(
    () => api.getMaintenancePlans(companyId),
    [companyId]
  );
  return [data || [], refetch, loading];
};

// Dashboard KPIs hook
export const useDashboardKPIs = (companyId?: string): [DashboardKPIs | null, () => void, boolean] => {
  const { data, loading, refetch } = useApiData<DashboardKPIs>(
    () => api.getKPIs(companyId),
    [companyId]
  );
  return [data, refetch, loading];
};

// Fallback hooks for data not yet available via API (use mock data)
import { 
  MOCK_SECTORS,
  MOCK_SUBSECTIONS,
  MOCK_STOCK_ITEMS
} from '@/data/mockData';

export const useSectors = (): [Sector[], () => void, boolean] => {
  return [MOCK_SECTORS, () => {}, false];
};

export const useSubSections = (): [SubSection[], () => void, boolean] => {
  return [MOCK_SUBSECTIONS, () => {}, false];
};

export const useStock = (): [StockItem[], () => void, boolean] => {
  return [MOCK_STOCK_ITEMS, () => {}, false];
};

// Authentication hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.login({ email, password });
      
      if (response.success) {
        api.setToken(response.data.tokens.access_token);
        setUser(response.data.user);
        
        // Save user info to localStorage for compatibility
        localStorage.setItem('auth:role', response.data.user.role);
        localStorage.setItem('auth:user', JSON.stringify({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role
        }));
        
        return true;
      } else {
        setError('Login failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    localStorage.removeItem('auth:role');
    localStorage.removeItem('auth:user');
    localStorage.removeItem('auth:token');
  };

  const getCurrentUser = async () => {
    try {
      if (api.getToken()) {
        const response = await api.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to get current user:', err);
      // If token is invalid, clear it
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('auth:token');
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    getCurrentUser,
    isAuthenticated: !!user
  };
};
