/**
 * React Query Hooks para Maintenance Plans (Planos de Manutenção)
 * 
 * NOTA: Usando store local para persistência
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadPlans, createPlan, updatePlan, deletePlan } from '@/data/plansStore';
import type { MaintenancePlan } from '@/models/plan';

// Tipos locais para compatibilidade
export interface PlanFilters {
  is_active?: boolean;
  frequency?: string[];
  search?: string;
}

export interface CreatePlanData {
  name: string;
  description?: string;
  frequency: MaintenancePlan['frequency'];
  scope?: MaintenancePlan['scope'];
  checklist_id?: string;
  status?: MaintenancePlan['status'];
  start_date?: string;
  auto_generate?: boolean;
}

// ============================================
// Query Keys
// ============================================

export const planKeys = {
  all: ['maintenancePlans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filters?: PlanFilters) => [...planKeys.lists(), filters] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  stats: () => [...planKeys.all, 'stats'] as const,
};

// ============================================
// Query Hooks (usando store local)
// ============================================

/**
 * Lista todos os planos
 */
export function usePlans(filters?: PlanFilters) {
  return useQuery({
    queryKey: planKeys.list(filters),
    queryFn: () => {
      let plans = loadPlans();
      
      // Aplicar filtros
      if (filters?.is_active !== undefined) {
        plans = plans.filter(p => (p.status === 'Ativo') === filters.is_active);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        plans = plans.filter(p => 
          p.name.toLowerCase().includes(search) || 
          p.description?.toLowerCase().includes(search)
        );
      }
      
      return Promise.resolve(plans);
    },
    staleTime: 0, // Sempre buscar dados frescos do localStorage
  });
}

/**
 * Lista planos ativos
 */
export function useActivePlans() {
  return usePlans({ is_active: true });
}

/**
 * Detalhes de um plano
 */
export function usePlan(id: string | null | undefined) {
  return useQuery({
    queryKey: planKeys.detail(id!),
    queryFn: () => {
      const plans = loadPlans();
      const plan = plans.find(p => p.id === id);
      return Promise.resolve(plan || null);
    },
    enabled: !!id,
  });
}

/**
 * Estatísticas dos planos
 */
export function usePlanStats() {
  return useQuery({
    queryKey: planKeys.stats(),
    queryFn: () => {
      const plans = loadPlans();
      return Promise.resolve({
        total: plans.length,
        active: plans.filter(p => p.status === 'Ativo').length,
        inactive: plans.filter(p => p.status === 'Inativo').length,
      });
    },
    staleTime: 0,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Cria novo plano
 */
export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanData) => {
      const planData: Omit<MaintenancePlan, 'id' | 'created_at' | 'updated_at'> = {
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        scope: data.scope || {
          location_id: '',
          location_name: '',
          equipment_ids: [],
          equipment_names: []
        },
        checklist_id: data.checklist_id,
        status: data.status || 'Ativo',
        start_date: data.start_date,
        auto_generate: data.auto_generate ?? false,
      };
      const newPlan = createPlan(planData);
      return Promise.resolve(newPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
    },
  });
}

/**
 * Atualiza plano
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenancePlan> }) => {
      const plans = loadPlans();
      const existingPlan = plans.find(p => p.id === id);
      if (!existingPlan) {
        return Promise.reject(new Error('Plano não encontrado'));
      }
      const updatedPlan = updatePlan({ ...existingPlan, ...data });
      return Promise.resolve(updatedPlan);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });
}

/**
 * Deleta plano
 */
export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      deletePlan(id);
      return Promise.resolve();
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: planKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
    },
  });
}

/**
 * Toggle ativo/inativo
 */
export function useTogglePlanActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      const plans = loadPlans();
      const existingPlan = plans.find(p => p.id === id);
      if (!existingPlan) {
        return Promise.reject(new Error('Plano não encontrado'));
      }
      const updatedPlan = updatePlan({
        ...existingPlan,
        status: isActive ? 'Ativo' : 'Inativo',
      });
      return Promise.resolve(updatedPlan);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
    },
  });
}

/**
 * Gera ordens de serviço (stub - precisa implementação real)
 */
export function useGenerateWorkOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      // TODO: Implementar geração real de ordens de serviço
      console.log('Gerando ordens de serviço para o plano:', planId);
      return Promise.resolve({
        work_orders_created: 1,
        next_execution_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    },
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
    },
  });
}

// ============================================
// Aliases para compatibilidade
// ============================================

/**
 * Alias para usePlans - mantém compatibilidade com código que usa MaintenancePlans
 */
export const useMaintenancePlans = usePlans;
