import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { EquipmentPage } from '@/pages/EquipmentPage';
import { WorkOrdersPage } from '@/pages/WorkOrdersPage';
import { RequestsPage } from '@/pages/RequestsPage';
import { PlansPage } from '@/pages/PlansPage';
import { MetricsPage } from '@/pages/MetricsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ativos" element={<EquipmentPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App