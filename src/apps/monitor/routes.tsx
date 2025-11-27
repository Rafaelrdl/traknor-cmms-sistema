import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  MonitorDashboard, 
  AlertsList, 
  SensorsPage, 
  MonitorAssetsPage, 
  RulesPage,
  ReportsPage,
  EditableOverviewPage
} from './pages';

/**
 * Rotas do módulo Monitor (TrakSense)
 * Prefixo: /monitor/*
 * 
 * Estrutura implementada:
 * - /monitor                → Visão Geral (Dashboard Customizável)
 * - /monitor/dashboard      → Dashboard de Monitoramento (KPIs)
 * - /monitor/alertas        → Lista de Alertas
 * - /monitor/sensores       → Grid de Sensores/Devices
 * - /monitor/ativos         → Lista de Ativos HVAC
 * - /monitor/regras         → Configuração de Regras
 * - /monitor/relatorios     → Relatórios de Monitoramento
 */
export function MonitorRoutes() {
  return (
    <Routes>
      {/* Visão Geral - Dashboard Customizável (página inicial) */}
      <Route path="/" element={<EditableOverviewPage />} />
      
      {/* Dashboard de KPIs */}
      <Route path="/dashboard" element={<MonitorDashboard />} />
      
      {/* Lista de alertas */}
      <Route path="/alertas" element={<AlertsList />} />
      
      {/* Grid de sensores/devices */}
      <Route path="/sensores" element={<SensorsPage />} />
      
      {/* Lista de ativos HVAC */}
      <Route path="/ativos" element={<MonitorAssetsPage />} />
      
      {/* Configuração de regras */}
      <Route path="/regras" element={<RulesPage />} />

      {/* Relatórios */}
      <Route path="/relatorios" element={<ReportsPage />} />
      
      {/* Fallback - redireciona para dashboard */}
      <Route path="/*" element={<Navigate to="/monitor" replace />} />
    </Routes>
  );
}
