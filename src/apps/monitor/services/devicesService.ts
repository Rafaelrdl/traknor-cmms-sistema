/**
 * Service para gerenciar Devices (dispositivos IoT)
 * 
 * Devices representam os dispositivos físicos instalados nos ativos
 * (ex: Gateways, Controladores, Sensores, etc.)
 * 
 * Endpoints disponíveis:
 * - GET /sites/{id}/devices/ - Lista devices de um site
 * - GET /devices/ - Lista todos os devices
 * - GET /devices/{id}/ - Detalhes de um device
 * - GET /sites/{id}/devices/summary/ - Lista devices com variáveis agrupadas
 * - GET /devices/{id}/summary/ - Device com variáveis agrupadas
 */

import { monitorApi } from './api';
import type { Device, DeviceSummary, DeviceFilters } from '../types/device';

// Helper para converter DeviceFilters em Record
const toParams = (filters?: DeviceFilters): Record<string, string | number | boolean | undefined> | undefined => {
  if (!filters) return undefined;
  return { ...filters };
};

const normalizeDevice = (device: any): Device => {
  const status = (device.status ?? '').toString();
  const boolStatus = typeof device.is_online === 'boolean'
    ? device.is_online
    : status.toUpperCase() === 'ONLINE';

  const asset =
    typeof device.asset === 'object' && device.asset !== null
      ? device.asset
      : device.asset
        ? {
            id: device.asset,
            name: device.asset_name ?? undefined,
            tag: device.asset_tag ?? undefined,
          }
        : undefined;

  return {
    id: device.id,
    name: device.name,
    serial_number: device.serial_number,
    mqtt_client_id: device.mqtt_client_id,
    device_type: device.device_type,
    status,
    is_online: boolStatus,
    firmware_version: device.firmware_version,
    last_seen: device.last_seen,
    asset,
    created_at: device.created_at,
    updated_at: device.updated_at,
  };
};

export const devicesService = {
  /**
   * Lista devices de um site específico
   */
  async listBySite(siteId: number, filters?: DeviceFilters): Promise<Device[]> {
    const response = await monitorApi.get<any>(`/sites/${siteId}/devices/`, toParams(filters));
    const payload = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];
    return payload.map(normalizeDevice);
  },

  /**
   * Lista todos os devices com filtros
   */
  async getAll(filters?: DeviceFilters): Promise<Device[]> {
    const response = await monitorApi.get<any>('/devices/', toParams(filters));
    const payload = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];
    return payload.map(normalizeDevice);
  },

  /**
   * Busca um device específico por ID
   */
  async getById(id: number): Promise<Device> {
    const response = await monitorApi.get<any>(`/devices/${id}/`);
    return normalizeDevice(response);
  },

  /**
   * Busca devices por tipo
   */
  async getByType(deviceType: string): Promise<Device[]> {
    return this.getAll({ device_type: deviceType });
  },

  /**
   * Busca devices online
   */
  async getOnline(): Promise<Device[]> {
    return this.getAll({ is_online: true });
  },

  /**
   * Lista devices de um site com variáveis agrupadas (Device Summary)
   * 
   * Retorna devices com todas as variáveis (sensores) agrupadas,
   * incluindo contagem de variáveis online/offline e informações do asset.
   */
  async getSummaryBySite(siteId: number, filters?: DeviceFilters): Promise<DeviceSummary[]> {
    return monitorApi.get<DeviceSummary[]>(`/sites/${siteId}/devices/summary/`, toParams(filters));
  },

  /**
   * Busca um device específico com variáveis agrupadas (Device Summary)
   */
  async getSummaryById(deviceId: number): Promise<DeviceSummary> {
    return monitorApi.get<DeviceSummary>(`/devices/${deviceId}/summary/`);
  },
};
