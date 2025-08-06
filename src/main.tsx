import { createRoot } from 'react-dom/client'
import "@github/spark/spark"
import { ErrorFallback } fr

import "./styles/theme.css"ument.getElementById('root')!)

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>

)






