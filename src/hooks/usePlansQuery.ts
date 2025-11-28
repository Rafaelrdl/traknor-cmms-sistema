/**
 * React Query Hooks para Maintenance Plans (Planos de Manutenção)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansService, type PlanFilters, type CreatePlanData } from '@/services/plansService';
import { isUserAuthenticated } from '@/hooks/useAuth';
import { workOrderKeys } from './useWorkOrdersQuery';

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
// Query Hooks
// ============================================

/**
 * Lista todos os planos
 */
export function usePlans(filters?: PlanFilters) {
  return useQuery({
    queryKey: planKeys.list(filters),
    queryFn: () => plansService.getAll(filters),
    staleTime: 1000 * 60 * 5,
    enabled: isUserAuthenticated(),
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
    queryFn: () => plansService.getById(id!),
    enabled: !!id && isUserAuthenticated(),
  });
}

/**
 * Estatísticas dos planos
 */
export function usePlanStats() {
  return useQuery({
    queryKey: planKeys.stats(),
    queryFn: () => plansService.getStats(),
    staleTime: 1000 * 60 * 5,
    enabled: isUserAuthenticated(),
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
    mutationFn: (data: CreatePlanData) => plansService.create(data),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePlanData> }) =>
      plansService.update(id, data),
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
    mutationFn: (id: string) => plansService.delete(id),
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
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      plansService.toggleActive(id, isActive),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
    },
  });
}

/**
 * Gera ordens de serviço
 */
export function useGenerateWorkOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => plansService.generateWorkOrders(planId),
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
      // Invalida work orders
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.stats() });
    },
  });
}

/**
 * Adiciona ativo ao plano
 */
export function useAddAssetToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, assetId }: { planId: string; assetId: string }) =>
      plansService.addAsset(planId, assetId),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
    },
  });
}

/**
 * Remove ativo do plano
 */
export function useRemoveAssetFromPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, assetId }: { planId: string; assetId: string }) =>
      plansService.removeAsset(planId, assetId),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
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
