/**
 * Service para gerenciar Assets (ativos HVAC)
 * 
 * Assets representam os equipamentos físicos monitorados
 * (ex: Chillers, AHUs, Boilers, etc.)
 */

import { monitorApi } from './api';
import type { Asset, AssetFilters, AssetSensor } from '../types/asset';

// Helper para converter filtros
const toParams = (filters?: AssetFilters): Record<string, string | number | boolean | undefined> | undefined => {
  if (!filters) return undefined;
  return { ...filters };
};

export const assetsService = {
  /**
   * Lista todos os assets
   */
  async getAll(filters?: AssetFilters): Promise<Asset[]> {
    const response = await monitorApi.get<any>('/assets/', toParams(filters));
    const payload = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];
    return payload;
  },

  /**
   * Lista assets com dados completos (incluindo métricas)
   */
  async getAllComplete(filters?: AssetFilters): Promise<Asset[]> {
    const response = await monitorApi.get<any>('/assets/complete/', toParams(filters));
    const payload = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];
    return payload;
  },

  /**
   * Busca um asset específico por ID
   */
  async getById(id: number): Promise<Asset> {
    return monitorApi.get<Asset>(`/assets/${id}/`);
  },

  /**
   * Busca sensores de um asset
   */
  async getSensors(assetId: number): Promise<AssetSensor[]> {
    return monitorApi.get<AssetSensor[]>(`/assets/${assetId}/sensors/`);
  },

  /**
   * Cria um novo asset
   */
  async create(asset: Partial<Asset>): Promise<Asset> {
    return monitorApi.post<Asset>('/assets/', asset);
  },

  /**
   * Atualiza um asset existente
   */
  async update(id: number, asset: Partial<Asset>): Promise<Asset> {
    return monitorApi.patch<Asset>(`/assets/${id}/`, asset);
  },

  /**
   * Remove um asset
   */
  async delete(id: number): Promise<void> {
    return monitorApi.delete<void>(`/assets/${id}/`);
  },
};
