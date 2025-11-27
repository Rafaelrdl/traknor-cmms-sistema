/**
 * Tipos de resposta da API Django REST Framework
 * 
 * Este arquivo contém as interfaces TypeScript que correspondem
 * aos modelos Django e respostas da API REST.
 */

/**
 * Resposta paginada padrão do Django REST Framework
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Site (localização física dos equipamentos)
 * Corresponde ao model Site em apps/assets/models.py
 */
export interface ApiSite {
  id: number;
  name: string;
  full_name: string;
  company: string;
  sector: string;
  subsector: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  timezone: string;
  asset_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Asset (equipamento HVAC)
 * Corresponde ao model Asset em apps/assets/models.py
 */
export interface ApiAsset {
  id: number;
  tag: string;
  name: string;
  site: number;
  site_name: string;
  full_location: string;
  asset_type: 
    | 'AHU' 
    | 'CHILLER' 
    | 'VRF' 
    | 'RTU' 
    | 'BOILER' 
    | 'COOLING_TOWER'
    | 'FAN_COIL'
    | 'PUMP'
    | 'AHU_COMPACTO'
    | 'SPLIT'
    | 'VAV'
    | 'HEAT_EXCHANGER'
    | 'DAMPER'
    | 'HUMIDIFIER'
    | 'DEHUMIDIFIER';
  asset_type_other: string | null;
  manufacturer: string;
  model: string;
  serial_number: string;
  location_description: string;
  installation_date: string | null;
  last_maintenance: string | null;
  status: 'OK' | 'MAINTENANCE' | 'STOPPED' | 'ALERT';
  health_score: number;
  specifications: Record<string, any>;
  device_count: number;
  sensor_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Device (dispositivo IoT/sensor físico)
 */
export interface ApiDevice {
  id: number;
  device_id: string;
  name: string;
  asset: number;
  asset_name: string;
  device_type: 'KHOMP' | 'MODBUSRTU' | 'MODBUSTCP' | 'MQTT' | 'API' | 'OTHER';
  protocol: string;
  firmware_version: string;
  hardware_version: string;
  is_online: boolean;
  last_seen: string | null;
  configuration: Record<string, any>;
  sensor_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Sensor (ponto de telemetria)
 */
export interface ApiSensor {
  id: number;
  sensor_id: string;
  name: string;
  device: number;
  device_name: string;
  sensor_type: 'TEMPERATURE' | 'HUMIDITY' | 'PRESSURE' | 'VIBRATION' | 'CURRENT' | 'VOLTAGE' | 'POWER' | 'FLOW' | 'LEVEL' | 'SPEED' | 'STATE' | 'OTHER';
  unit: string;
  min_value: number | null;
  max_value: number | null;
  alert_threshold_low: number | null;
  alert_threshold_high: number | null;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Telemetry (leitura de sensor)
 */
export interface ApiTelemetry {
  id: number;
  sensor: number;
  sensor_name: string;
  value: number;
  unit: string;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  timestamp: string;
  raw_data: Record<string, any> | null;
}

/**
 * Alert (alerta gerado pelo sistema)
 */
export interface ApiAlert {
  id: number;
  sensor: number;
  sensor_name: string;
  asset_name: string;
  site_name: string;
  alert_type: 'HIGH_VALUE' | 'LOW_VALUE' | 'OFFLINE' | 'MAINTENANCE_DUE' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  value: number | null;
  threshold: number | null;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

/**
 * Rule (regra de alerta)
 */
export interface ApiRule {
  id: number;
  name: string;
  description: string;
  sensor: number | null;
  sensor_name: string | null;
  asset: number | null;
  asset_name: string | null;
  condition_type: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'NEQ' | 'BETWEEN' | 'OUTSIDE';
  threshold_value: number;
  threshold_value_2: number | null;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  is_active: boolean;
  cooldown_minutes: number;
  notification_channels: string[];
  created_at: string;
  updated_at: string;
}

/**
 * User (usuário do sistema)
 */
export interface ApiUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'VIEWER';
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

/**
 * Auth Response
 */
export interface AuthResponse {
  user: ApiUser;
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
  access_token?: string; // Only if not using HttpOnly cookies
  refresh_token?: string; // Only if not using HttpOnly cookies
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Error Response
 */
export interface ApiError {
  detail: string;
  code?: string;
  errors?: Record<string, string[]>;
}
