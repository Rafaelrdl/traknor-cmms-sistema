import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  MonitorDashboard, 
  EquipmentRealtime, 
  AlertsList, 
  SensorsPage, 
  MonitorAssetsPage, 
  RulesPage,
  SettingsPage,
  ReportsPage,
  MaintenancePage,
  EditableOverviewPage
} from './pages';

/**
 * Rotas do módulo Monitor (TrakSense)
 * Prefixo: /monitor/*
 * 
 * Estrutura implementada:
 * - /monitor                → Visão Geral (Dashboard Customizável)
 * - /monitor/dashboard      → Dashboard de Monitoramento (KPIs)
 * - /monitor/equipamentos/:id → Visualização em tempo real do equipamento
 * - /monitor/alertas        → Lista de Alertas
 * - /monitor/sensores       → Grid de Sensores/Devices
 * - /monitor/ativos         → Lista de Ativos HVAC
 * - /monitor/regras         → Configuração de Regras
 * - /monitor/relatorios     → Relatórios de Monitoramento
 * - /monitor/configuracoes  → Configurações do Sistema
 * - /monitor/manutencao     → Manutenção Preditiva
 */
export function MonitorRoutes() {
  return (
    <Routes>
      {/* Visão Geral - Dashboard Customizável (página inicial) */}
      <Route path="/" element={<EditableOverviewPage />} />
      
      {/* Dashboard de KPIs */}
      <Route path="/dashboard" element={<MonitorDashboard />} />
      
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

      {/* Relatórios */}
      <Route path="/relatorios" element={<ReportsPage />} />

      {/* Configurações */}
      <Route path="/configuracoes" element={<SettingsPage />} />

      {/* Manutenção Preditiva */}
      <Route path="/manutencao" element={<MaintenancePage />} />
      
      {/* Fallback - redireciona para dashboard */}
      <Route path="/*" element={<Navigate to="/monitor" replace />} />
    </Routes>
  );
}
