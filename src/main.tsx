import React from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorFallback } from './ErrorFallback.tsx'
import App from './App.tsx'
import './index.css'
import "./styles/theme.css"

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Import Spark runtime safely
try {
  import("@github/spark/spark").catch(err => {
    console.warn('Spark runtime not available:', err);
  });
} catch (err) {
  console.warn('Failed to import Spark runtime:', err);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Wrap in StrictMode only in development to catch potential issues
const AppWrapper = import.meta.env.DEV ? StrictMode : ({ children }: { children: React.ReactNode }) => <>{children}</>;

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <AppWrapper>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AppWrapper>
  </ErrorBoundary>
)