import { createRoot } from 'react-dom/client'
import "@github/spark/spark"
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from './ErrorFallback'
import App from './App'
import './index.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
)