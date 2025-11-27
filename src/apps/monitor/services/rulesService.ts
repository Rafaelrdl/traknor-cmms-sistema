/**
 * Service para gerenciar Rules (regras de monitoramento)
 * 
 * Rules definem condições para disparo automático de alertas
 */

import { monitorApi } from './api';
import type { 
  Rule, 
  RuleFilters, 
  CreateRuleRequest, 
  UpdateRuleRequest,
  RuleStatistics 
} from '../types/rule';

// Helper para converter filtros
const toParams = (filters?: RuleFilters): Record<string, string | number | boolean | undefined> | undefined => {
  if (!filters) return undefined;
  return { ...filters };
};

interface PaginatedResponse<T> {
  results: T[];
  count: number;
}

export const rulesService = {
  /**
   * Lista todas as regras
   */
  async list(filters?: RuleFilters): Promise<PaginatedResponse<Rule>> {
    return monitorApi.get<PaginatedResponse<Rule>>('/rules/', toParams(filters));
  },

  /**
   * Busca uma regra específica
   */
  async get(id: number): Promise<Rule> {
    return monitorApi.get<Rule>(`/rules/${id}/`);
  },

  /**
   * Cria uma nova regra
   */
  async create(data: CreateRuleRequest): Promise<Rule> {
    return monitorApi.post<Rule>('/rules/', data);
  },

  /**
   * Atualiza uma regra (PATCH - parcial)
   */
  async patch(id: number, data: UpdateRuleRequest): Promise<Rule> {
    return monitorApi.patch<Rule>(`/rules/${id}/`, data);
  },

  /**
   * Atualiza uma regra (PUT - completo)
   */
  async update(id: number, data: CreateRuleRequest): Promise<Rule> {
    return monitorApi.put<Rule>(`/rules/${id}/`, data);
  },

  /**
   * Remove uma regra
   */
  async delete(id: number): Promise<void> {
    return monitorApi.delete<void>(`/rules/${id}/`);
  },

  /**
   * Toggle status de uma regra (enabled/disabled)
   */
  async toggleStatus(id: number): Promise<Rule> {
    return monitorApi.post<Rule>(`/rules/${id}/toggle_status/`);
  },

  /**
   * Estatísticas das regras
   */
  async statistics(): Promise<RuleStatistics> {
    return monitorApi.get<RuleStatistics>('/rules/statistics/');
  },
};
