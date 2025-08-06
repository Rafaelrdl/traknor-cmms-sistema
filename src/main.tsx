import { createRoot } from 'react-dom/client'
import "@github/spark/spark"
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from './ErrorFallback.tsx'
import App from './App.tsx'
import './index.css'
import "./styles/theme.css"

const root = createRoot(document.getElementById('root')!)

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
)