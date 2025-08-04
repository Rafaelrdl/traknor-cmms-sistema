import { useCallback } from 'react';

export const useApi = () => {
  const apiCall = useCallback(async (endpoint: string, options?: RequestInit) => {
    // Usa caminho relativo para aproveitar proxy do Vite
    const url = `/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
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
      return { mock: true, error: (error as Error).message };
    }
  }, []);
  
  return { apiCall };
};
