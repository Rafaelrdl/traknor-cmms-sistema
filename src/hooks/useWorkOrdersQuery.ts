/**
 * React Query Hooks para Work Orders (Ordens de Serviço)
 * 
 * Hooks para gerenciamento de OS com:
 * - Cache automático
 * - Refetch inteligente
 * - Invalidação de queries relacionadas
 * - Optimistic updates
 * - Integração com localStorage para OSs geradas localmente
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { workOrdersService, type WorkOrderFilters, type CompleteWorkOrderData, type WorkOrderStats } from '@/services/workOrdersService';
import { loadWorkOrders } from '@/data/workOrdersStore';
import { isUserAuthenticated } from '@/hooks/useAuth';
import type { WorkOrder } from '@/types';
import type { WorkOrder as LocalWorkOrder } from '@/models/workOrder';

// ============================================
// Helpers para conversão de modelos
// ============================================

/**
 * Converte WorkOrder do modelo local (português) para o modelo da API (inglês)
 */
function convertLocalToApiWorkOrder(local: LocalWorkOrder): WorkOrder {
  const statusMap: Record<string, WorkOrder['status']> = {
    'Aberta': 'OPEN',
    'Em Execução': 'IN_PROGRESS',
    'Concluída': 'COMPLETED',
  };
  
  const typeMap: Record<string, WorkOrder['type']> = {
    'Preventiva': 'PREVENTIVE',
    'Corretiva': 'CORRECTIVE',
  };
  
  const priorityMap: Record<string, WorkOrder['priority']> = {
    'Baixa': 'LOW',
    'Média': 'MEDIUM',
    'Alta': 'HIGH',
    'Crítica': 'CRITICAL',
  };
  
  return {
    id: local.id,
    number: local.number,
    equipmentId: local.equipment_ids?.[0] || '',
    type: typeMap[local.type] || 'PREVENTIVE',
    status: statusMap[local.status] || 'OPEN',
    scheduledDate: local.scheduled_date,
    assignedTo: local.assigned_to,
    assignedToName: local.assigned_to_name,
    priority: priorityMap[local.priority] || 'MEDIUM',
    description: local.title || local.description || '',
    createdAt: local.created_at,
    startedAt: local.started_at,
    completedAt: local.completed_at,
    checklistResponses: local.tasks?.map(task => ({
      taskId: task.id,
      taskName: task.name,
      completed: task.completed,
    })),
  };
}

// ============================================
// Query Keys
// ============================================

export const workOrderKeys = {
  all: ['workOrders'] as const,
  lists: () => [...workOrderKeys.all, 'list'] as const,
  list: (filters?: WorkOrderFilters) => [...workOrderKeys.lists(), filters] as const,
  details: () => [...workOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...workOrderKeys.details(), id] as const,
  stats: () => [...workOrderKeys.all, 'stats'] as const,
  byAsset: (assetId: string) => [...workOrderKeys.all, 'byAsset', assetId] as const,
  overdue: () => [...workOrderKeys.all, 'overdue'] as const,
  upcoming: (days?: number) => [...workOrderKeys.all, 'upcoming', days] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Lista todas as ordens de serviço com filtros
 * Mescla dados da API com dados do localStorage (OSs geradas localmente)
 */
export function useWorkOrders(filters?: WorkOrderFilters) {
  return useQuery({
    queryKey: workOrderKeys.list(filters),
    queryFn: async () => {
      // Buscar da API
      let apiWorkOrders: WorkOrder[] = [];
      try {
        apiWorkOrders = await workOrdersService.getAll(filters);
      } catch (error) {
        console.warn('Erro ao buscar OSs da API, usando apenas localStorage:', error);
      }
      
      // Buscar do localStorage (OSs geradas localmente pelos planos)
      const localWorkOrders = loadWorkOrders();
      console.log('[useWorkOrders] OSs locais encontradas:', localWorkOrders.length, localWorkOrders);
      
      const convertedLocalWorkOrders = localWorkOrders.map(convertLocalToApiWorkOrder);
      console.log('[useWorkOrders] OSs convertidas:', convertedLocalWorkOrders);
      
      // Mesclar, evitando duplicatas por ID
      const apiIds = new Set(apiWorkOrders.map(wo => wo.id));
      const uniqueLocalWorkOrders = convertedLocalWorkOrders.filter(wo => !apiIds.has(wo.id));
      
      console.log('[useWorkOrders] OSs da API:', apiWorkOrders.length);
      console.log('[useWorkOrders] OSs locais únicas:', uniqueLocalWorkOrders.length);
      
      const allWorkOrders = [...apiWorkOrders, ...uniqueLocalWorkOrders];
      
      // Ordenar por data de criação (mais recentes primeiro)
      allWorkOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.scheduledDate).getTime();
        const dateB = new Date(b.createdAt || b.scheduledDate).getTime();
        return dateB - dateA;
      });
      
      return allWorkOrders;
    },
    staleTime: 0, // Sempre buscar dados frescos para incluir OSs recém-geradas
    enabled: isUserAuthenticated(),
  });
}

/**
 * Lista paginada de ordens de serviço
 */
export function useWorkOrdersPaginated(filters?: WorkOrderFilters) {
  return useQuery({
    queryKey: [...workOrderKeys.list(filters), 'paginated'],
    queryFn: () => workOrdersService.getAllPaginated(filters),
    staleTime: 1000 * 60 * 2,
    enabled: isUserAuthenticated(),
  });
}

/**
 * Lista infinita para scroll infinito
 */
export function useWorkOrdersInfinite(filters?: Omit<WorkOrderFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...workOrderKeys.list(filters), 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      workOrdersService.getAllPaginated({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2,
    enabled: isUserAuthenticated(),
  });
}

/**
 * Detalhes de uma ordem de serviço
 */
export function useWorkOrder(id: string | null | undefined) {
  return useQuery({
    queryKey: workOrderKeys.detail(id!),
    queryFn: () => workOrdersService.getById(id!),
    enabled: !!id && isUserAuthenticated(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Estatísticas das ordens de serviço
 */
export function useWorkOrderStats() {
  return useQuery({
    queryKey: workOrderKeys.stats(),
    queryFn: () => workOrdersService.getStats(),
    staleTime: 1000 * 60 * 5,
    enabled: isUserAuthenticated(),
  });
}

/**
 * Ordens de serviço de um equipamento específico
 */
export function useWorkOrdersByAsset(assetId: string | null | undefined) {
  return useQuery({
    queryKey: workOrderKeys.byAsset(assetId!),
    queryFn: () => workOrdersService.getByAsset(assetId!),
    enabled: !!assetId && isUserAuthenticated(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Ordens de serviço atrasadas
 */
export function useOverdueWorkOrders() {
  return useQuery({
    queryKey: workOrderKeys.overdue(),
    queryFn: () => workOrdersService.getOverdue(),
    staleTime: 1000 * 60 * 5,
    enabled: isUserAuthenticated(),
  });
}

/**
 * Próximas ordens de serviço
 */
export function useUpcomingWorkOrders(days: number = 7) {
  return useQuery({
    queryKey: workOrderKeys.upcoming(days),
    queryFn: () => workOrdersService.getUpcoming(days),
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Cria uma nova ordem de serviço
 */
export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WorkOrder>) => workOrdersService.create(data),
    onSuccess: () => {
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.stats() });
    },
  });
}

/**
 * Atualiza uma ordem de serviço
 */
export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkOrder> }) =>
      workOrdersService.update(id, data),
    onSuccess: (updatedWO, { id }) => {
      // Atualiza cache do item específico
      queryClient.setQueryData(workOrderKeys.detail(id), updatedWO);
      // Invalida listas
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
    },
  });
}

/**
 * Deleta uma ordem de serviço
 */
export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workOrdersService.delete(id),
    onSuccess: (_, id) => {
      // Remove do cache
      queryClient.removeQueries({ queryKey: workOrderKeys.detail(id) });
      // Invalida listas
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.stats() });
    },
  });
}

/**
 * Inicia uma ordem de serviço
 */
export function useStartWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId?: string }) => 
      workOrdersService.start(id, technicianId),
    onSuccess: (updatedWO, { id }) => {
      queryClient.setQueryData(workOrderKeys.detail(id), updatedWO);
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.stats() });
    },
  });
}

/**
 * Conclui uma ordem de serviço
 */
export function useCompleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteWorkOrderData }) =>
      workOrdersService.complete(id, data),
    onSuccess: (updatedWO, { id }) => {
      queryClient.setQueryData(workOrderKeys.detail(id), updatedWO);
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.stats() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.overdue() });
    },
  });
}

/**
 * Cancela uma ordem de serviço
 */
export function useCancelWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      workOrdersService.cancel(id, reason),
    onSuccess: (updatedWO, { id }) => {
      queryClient.setQueryData(workOrderKeys.detail(id), updatedWO);
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.stats() });
    },
  });
}

/**
 * Upload de foto
 */
export function useUploadWorkOrderPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file, caption }: { id: string; file: File; caption?: string }) =>
      workOrdersService.uploadPhoto(id, file, caption),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(id) });
    },
  });
}

/**
 * Remove foto
 */
export function useDeleteWorkOrderPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, photoId }: { workOrderId: string; photoId: string }) =>
      workOrdersService.deletePhoto(workOrderId, photoId),
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
    },
  });
}

/**
 * Adiciona item de estoque
 */
export function useAddWorkOrderStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, itemId, quantity }: { workOrderId: string; itemId: string; quantity: number }) =>
      workOrdersService.addStockItem(workOrderId, itemId, quantity),
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
    },
  });
}

/**
 * Remove item de estoque
 */
export function useRemoveWorkOrderStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workOrderId, itemId }: { workOrderId: string; itemId: string }) =>
      workOrdersService.removeStockItem(workOrderId, itemId),
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrderId) });
    },
  });
}

// ============================================
// Prefetch Helpers
// ============================================

/**
 * Prefetch de detalhes de uma OS (para hover/preload)
 */
export function usePrefetchWorkOrder() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: workOrderKeys.detail(id),
      queryFn: () => workOrdersService.getById(id),
      staleTime: 1000 * 60 * 5,
    });
  };
}
