import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { EquipmentPage } from '@/pages/EquipmentPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { MetricsPage } from '@/pages/MetricsPage';
import { PlansPage } from '@/pages/PlansPage';
import { ProceduresPage } from '@/pages/ProceduresPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { RequestsPage } from '@/pages/RequestsPage';
import { WorkOrdersPage } from '@/pages/WorkOrdersPage';

export function Router() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/procedures" element={<ProceduresPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/work-orders" element={<WorkOrdersPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}