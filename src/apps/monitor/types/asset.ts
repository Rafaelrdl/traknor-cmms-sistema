/**
 * Asset Types para o módulo Monitor
 * 
 * Tipos para ativos HVAC com integração IoT
 */

export type AssetStatus = 'OK' | 'ACTIVE' | 'Maintenance' | 'MAINTENANCE' | 
                          'Alert' | 'WARNING' | 'Stopped' | 'INACTIVE' | 'ERROR';

export type AssetType = 'Chiller' | 'AHU' | 'Boiler' | 'Pump' | 'Fan Coil' | 
                        'VRF' | 'Split' | 'Condensadora' | 'Torre de Resfriamento' | 'Outro';

export interface AssetSpecifications {
  capacity?: number;
  voltage?: number;
  refrigerant?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
}

export interface Asset {
  id: number;
  tag: string;
  name: string;
  type: AssetType;
  location: string;
  status: AssetStatus;
  healthScore?: number;
  powerConsumption?: number;
  specifications?: AssetSpecifications;
  siteId?: number;
  siteName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetFilters {
  site?: number;
  asset_type?: string;
  status?: string;
  search?: string;
}

export interface AssetSensor {
  id: number;
  tag: string;
  name: string;
  metric_type: string;
  unit: string;
  last_value: number | null;
  last_reading_at: string | null;
  is_online: boolean;
}
