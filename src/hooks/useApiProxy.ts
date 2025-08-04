import { useCallback } from 'react';

/**
 * Hook para fazer chamadas API usando proxy local
 * Evita problemas CORS entre Spark Preview e Codespace
 */
export const useApiProxy = () => {
  const apiCall = useCallback(async (endpoint: string, options?: RequestInit) => {
    // Usa caminho relativo para aproveitar proxy do Vite
    const url = `/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Spark-Preview': 'true',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      // Retorna dados mock em caso de erro
      return { 
        mock: true, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  const healthCheck = useCallback(async () => {
    try {
      const response = await fetch('/health');
      return await response.json();
    } catch (error) {
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Health check failed' 
      };
    }
  }, []);
  
  return { apiCall, healthCheck };
};
