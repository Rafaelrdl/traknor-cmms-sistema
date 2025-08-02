import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { EquipmentPage } from '@/pages/EquipmentPage';
import { WorkOrdersPage } from '@/pages/WorkOrdersPage';
import { RequestsPage } from '@/pages/RequestsPage';
import { PlansPage } from '@/pages/PlansPage';
import { MetricsPage } from '@/pages/MetricsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ProceduresPage } from '@/pages/ProceduresPage';
import { ReportsPage } from '@/pages/ReportsPage';

/**
 * Router principal da aplicação TrakNor CMMS
 * Configura todas as rotas do sistema de gestão de manutenção HVAC
 */
export function Router() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Dashboard - Página inicial */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Gestão de Ativos */}
          <Route path="/ativos" element={<EquipmentPage />} />
          
          {/* Ordens de Serviço */}
          <Route path="/work-orders" element={<WorkOrdersPage />} />
          
          {/* Solicitações de Manutenção */}
          <Route path="/requests" element={<RequestsPage />} />
          
          {/* Planos de Manutenção */}
          <Route path="/plans" element={<PlansPage />} />
          
          {/* Métricas e KPIs */}
          <Route path="/metrics" element={<MetricsPage />} />
          
          {/* Gestão de Estoque */}
          <Route path="/inventory" element={<InventoryPage />} />
          
          {/* Procedimentos de Manutenção */}
          <Route path="/procedures" element={<ProceduresPage />} />
          
          {/* Relatórios */}
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Rota de fallback - redireciona para Dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
