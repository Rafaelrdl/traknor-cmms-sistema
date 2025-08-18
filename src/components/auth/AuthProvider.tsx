import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while checking auth status

    const isLoginPage = location.pathname === '/login';
    
    if (!isAuthenticated && !isLoginPage) {
      // User not authenticated and not on login page, redirect to login
      navigate('/login');
    } else if (isAuthenticated && isLoginPage) {
      // User authenticated and on login page, redirect to dashboard
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}