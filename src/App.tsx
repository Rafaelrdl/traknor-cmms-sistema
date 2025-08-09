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
import { ProceduresPage } from '@/pages/ProceduresPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { TeamPage } from '@/pages/TeamPage';
import { Toaster } from '@/components/ui/sonner';
import { RoleSwitcher } from '@/components/auth/RoleSwitcher';

// Initialize PDF.js configuration BEFORE any PDF components load
import { configurePDFWorker } from '@/utils/pdfConfig';

// Initialize procedures module in development
if (import.meta.env.DEV) {
  import('@/utils/proceduresDevUtils');
  // Import PDF debug utilities in development
  import('@/utils/pdfDebug');
}

// Configure PDF worker immediately
configurePDFWorker();

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
            <Route path="/procedures" element={<ProceduresPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/team" element={<TeamPage />} />
          </Routes>
        </Layout>
        <Toaster />
        <RoleSwitcher />
      </Router>
    </QueryClientProvider>
  );
}

export default App