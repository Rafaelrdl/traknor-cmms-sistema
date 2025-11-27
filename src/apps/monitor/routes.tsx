import { Routes, Route, Navigate } from 'react-router-dom';
import { MonitorDashboard, EquipmentRealtime, AlertsList, SensorsPage, MonitorAssetsPage, RulesPage } from './pages';

/**
 * Rotas do módulo Monitor (TrakSense)
 * Prefixo: /monitor/*
 * 
 * Estrutura implementada:
 * - /monitor                → Dashboard de Monitoramento
 * - /monitor/equipamentos/:id → Visualização em tempo real do equipamento
 * - /monitor/alertas        → Lista de Alertas
 * - /monitor/sensores       → Grid de Sensores/Devices
 * - /monitor/ativos         → Lista de Ativos HVAC
 * - /monitor/regras         → Configuração de Regras
 * 
 * Estrutura planejada para próximas fases:
 * - /monitor/reports        → Relatórios de Monitoramento
 * - /monitor/settings       → Configurações
 */
export function MonitorRoutes() {
  return (
    <Routes>
      {/* Dashboard principal */}
      <Route path="/" element={<MonitorDashboard />} />
      
      {/* Visualização de equipamento em tempo real */}
      <Route path="/equipamentos/:id" element={<EquipmentRealtime />} />
      
      {/* Lista de alertas */}
      <Route path="/alertas" element={<AlertsList />} />
      
      {/* Grid de sensores/devices */}
      <Route path="/sensores" element={<SensorsPage />} />
      
      {/* Lista de ativos HVAC */}
      <Route path="/ativos" element={<MonitorAssetsPage />} />
      
      {/* Configuração de regras */}
      <Route path="/regras" element={<RulesPage />} />
      
      {/* Fallback - redireciona para dashboard */}
      <Route path="/*" element={<Navigate to="/monitor" replace />} />
    </Routes>
  );
}
