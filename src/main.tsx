import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./index.css"

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  const sparkRelated = [
    'curly-succotash',
    'app.github.dev',
    'fetch-patch',
    'spark-preview',
    'gstatic.com',
    'translate_http'
  ];
  
  const isSparkError = sparkRelated.some(pattern => 
    event.filename?.includes(pattern) || 
    event.message?.includes(pattern)
  );
  
  if (isSparkError) {
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary 
    FallbackComponent={ErrorFallback}
    onError={(error, errorInfo) => {
      // Only log non-Spark errors
      const sparkRelated = [
        'curly-succotash',
        'app.github.dev', 
        'fetch-patch',
        'spark-preview'
      ];
      
      const isSparkError = sparkRelated.some(pattern => 
        error.message?.includes(pattern) || 
        error.stack?.includes(pattern)
      );
      
      if (!isSparkError) {
        console.error('Application Error:', error, errorInfo);
      }
    }}
  >
    <App />
   </ErrorBoundary>
)
