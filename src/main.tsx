import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Importar e inicializar Spark Middleware - GitHub integration
import './middleware/sparkMiddleware.ts';

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
