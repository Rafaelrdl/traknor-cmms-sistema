/**
 * React Query hooks para Checklists
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listChecklistCategories,
  getChecklistCategory,
  createChecklistCategory,
  updateChecklistCategory,
  deleteChecklistCategory,
  listChecklistTemplates,
  getChecklistTemplate,
  createChecklistTemplate,
  updateChecklistTemplate,
  deleteChecklistTemplate,
  getChecklistStats,
  duplicateChecklistTemplate,
  toggleChecklistTemplateActive,
  incrementChecklistUsage,
  type ChecklistCategoryInput,
  type ChecklistFilters,
  type ChecklistTemplateInput,
  type ApiChecklistCategory,
  type ApiChecklistTemplate,
  type ApiChecklistStats,
} from '@/services/checklistsService';

// ============================================
// Query Keys
// ============================================

export const checklistKeys = {
  all: ['checklists'] as const,
  lists: () => [...checklistKeys.all, 'list'] as const,
  list: (filters?: ChecklistFilters) => [...checklistKeys.lists(), filters] as const,
  details: () => [...checklistKeys.all, 'detail'] as const,
  detail: (id: number) => [...checklistKeys.details(), id] as const,
  stats: () => [...checklistKeys.all, 'stats'] as const,
};

export const checklistCategoryKeys = {
  all: ['checklist-categories'] as const,
  lists: () => [...checklistCategoryKeys.all, 'list'] as const,
  details: () => [...checklistCategoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...checklistCategoryKeys.details(), id] as const,
};

// ============================================
// Hooks de Categorias
// ============================================

export function useChecklistCategories() {
  return useQuery({
    queryKey: checklistCategoryKeys.lists(),
    queryFn: listChecklistCategories,
  });
}

export function useChecklistCategory(id: number) {
  return useQuery({
    queryKey: checklistCategoryKeys.detail(id),
    queryFn: () => getChecklistCategory(id),
    enabled: !!id,
  });
}

export function useCreateChecklistCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChecklistCategoryInput) => createChecklistCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistCategoryKeys.all });
      toast.success('Categoria criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar categoria: ${error.message}`);
    },
  });
}

export function useUpdateChecklistCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ChecklistCategoryInput> }) => 
      updateChecklistCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistCategoryKeys.all });
      toast.success('Categoria atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar categoria: ${error.message}`);
    },
  });
}

export function useDeleteChecklistCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteChecklistCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistCategoryKeys.all });
      toast.success('Categoria excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir categoria: ${error.message}`);
    },
  });
}

// ============================================
// Hooks de Checklists
// ============================================

export function useChecklists(filters?: ChecklistFilters) {
  return useQuery({
    queryKey: checklistKeys.list(filters),
    queryFn: () => listChecklistTemplates(filters),
  });
}

export function useChecklist(id: number) {
  return useQuery({
    queryKey: checklistKeys.detail(id),
    queryFn: () => getChecklistTemplate(id),
    enabled: !!id,
  });
}

export function useChecklistStats() {
  return useQuery({
    queryKey: checklistKeys.stats(),
    queryFn: getChecklistStats,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChecklistTemplateInput) => createChecklistTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.all });
      toast.success('Checklist criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar checklist: ${error.message}`);
    },
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ChecklistTemplateInput> }) => 
      updateChecklistTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.all });
      toast.success('Checklist atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar checklist: ${error.message}`);
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteChecklistTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.all });
      toast.success('Checklist excluído com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir checklist: ${error.message}`);
    },
  });
}

export function useDuplicateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => duplicateChecklistTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.all });
      toast.success('Checklist duplicado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao duplicar checklist: ${error.message}`);
    },
  });
}

export function useToggleChecklistActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      toggleChecklistTemplateActive(id, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.all });
      toast.success(isActive ? 'Checklist ativado' : 'Checklist desativado');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });
}

export function useIncrementChecklistUsage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => incrementChecklistUsage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.all });
    },
  });
}

// ============================================
// Re-exportar tipos
// ============================================

export type {
  ApiChecklistCategory,
  ApiChecklistTemplate,
  ApiChecklistStats,
  ChecklistFilters,
  ChecklistTemplateInput,
  ChecklistCategoryInput,
};
