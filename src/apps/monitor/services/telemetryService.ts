/**
 * Telemetry Service para o módulo Monitor
 * 
 * Serviço para comunicação com os endpoints de telemetria do backend.
 */

import { monitorApi } from './api';

export interface DeviceHistoryResponse {
  deviceId: string;
  series: Array<{
    sensorId: string;
    sensorType?: string;
    unit?: string;
    data: Array<{
      timestamp: string;
      value: number;
    }>;
  }>;
}

/**
 * TelemetryService - Métodos para consumir API de telemetria.
 */
class TelemetryService {
  private baseUrl = '/telemetry';

  /**
   * GET /api/telemetry/assets/<asset_tag>/history/
   * Buscar histórico de telemetria por asset tag.
   * 
   * @param assetTag - Tag do asset (ex: CHILLER-001)
   * @param hours - Número de horas de histórico
   * @param sensorIds - (Opcional) Array de sensor IDs para filtrar
   * @param forceInterval - (Opcional) Forçar intervalo específico
   * @returns Histórico temporal
   */
  async getHistoryByAsset(
    assetTag: string,
    hours: number = 24,
    sensorIds?: string[],
    forceInterval?: string
  ): Promise<DeviceHistoryResponse> {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
    
    // Determinar intervalo de agregação baseado no período
    let interval: string;
    if (forceInterval) {
      interval = forceInterval;
    } else if (hours < 1) {
      interval = 'raw';
    } else if (hours <= 6) {
      interval = '1m';
    } else if (hours <= 24) {
      interval = '5m';
    } else if (hours <= 168) {
      interval = '15m';
    } else {
      interval = '1h';
    }
    
    const queryParams = new URLSearchParams();
    queryParams.append('from', start.toISOString());
    queryParams.append('to', end.toISOString());
    queryParams.append('interval', interval);
    
    // Adicionar sensor_id múltiplos vezes se houver array
    if (sensorIds && sensorIds.length > 0) {
      sensorIds.forEach(id => queryParams.append('sensor_id', id));
    }

    try {
      const url = `/telemetry/assets/${assetTag}/history/?${queryParams.toString()}`;
      const response = await monitorApi.get<any>(url);
      
      // Mapear resposta da API
      return {
        deviceId: assetTag,
        series: response.series?.map((s: any) => ({
          sensorId: s.sensor_id || s.sensorId,
          sensorType: s.sensor_type || s.metric_type,
          unit: s.unit,
          data: (s.data || s.readings || []).map((d: any) => ({
            timestamp: d.timestamp || d.time,
            value: d.value ?? d.avg ?? d.mean ?? 0
          }))
        })) || []
      };
    } catch (error) {
      console.error('Erro ao buscar telemetria:', error);
      return {
        deviceId: assetTag,
        series: []
      };
    }
  }

  /**
   * GET /api/telemetry/latest/<device_id>/
   * Retorna últimas leituras de todos os sensores do device.
   */
  async getLatest(deviceId: string, sensorId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (sensorId) {
      params.append('sensor_id', sensorId);
    }

    const url = `/telemetry/latest/${deviceId}/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await monitorApi.get<any>(url);
    return response;
  }
}

export const telemetryService = new TelemetryService();
