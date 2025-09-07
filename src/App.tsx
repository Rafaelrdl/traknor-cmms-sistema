import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { QuickSetupPage } from '@/pages/QuickSetupPage';
import { WelcomeTourPage } from '@/pages/WelcomeTourPage';
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
import { HelpCenterPage } from '@/pages/HelpCenterPage';
import { HelpContentViewPage } from '@/pages/HelpContentViewPage';
import { PlansTestingPage } from '@/pages/PlansTestingPage';
import { Toaster } from '@/components/ui/sonner';
// import { RoleSwitcher } from '@/components/auth/RoleSwitcher';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { OnboardingManager } from '@/hooks/useOnboardingFlow';

// Initialize PDF.js configuration safely
try {
  import('@/utils/pdfConfig').then(({ configurePDFWorker }) => {
    configurePDFWorker();
  });
} catch (error) {
  console.warn('Failed to configure PDF worker:', error);
}

// Initialize procedures module in development
if (import.meta.env.DEV) {
  try {
    import('@/utils/proceduresDevUtils');
    // Import PDF debug utilities in development
    import('@/utils/pdfDebug');
  } catch (error) {
    console.warn('Failed to load development utilities:', error);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on certain errors that indicate permanent failures
        if (error instanceof TypeError && error.message.includes('useRef')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <OnboardingManager>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/onboarding/accept" element={<OnboardingPage />} />
              <Route path="/quick-setup" element={<QuickSetupPage />} />
              <Route path="/welcome-tour" element={<WelcomeTourPage />} />
              <Route path="/*" element={
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
                    <Route path="/help" element={<HelpCenterPage />} />
                    <Route path="/help/:contentId" element={<HelpContentViewPage />} />
                    <Route path="/plans-testing" element={<PlansTestingPage />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </OnboardingManager>
          <Toaster />
          {/* <RoleSwitcher /> */}
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App