// CRÍTICO: Estes imports DEVEM ser os PRIMEIROS - antes até do React
import './utils/patchFetchPatch';  // NOVO - Mais agressivo
import './utils/interceptRequests';
import './utils/patchTanStackQuery';

import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
