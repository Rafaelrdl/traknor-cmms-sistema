import './index.css';
import { SparkBridge } from './components/SparkBridge';
import { Router } from './Router';
import { suppressSparkErrors } from './utils/suppressSparkErrors';
import { setupSparkEnvironment } from './utils/sparkEnvironment';

// Setup Spark environment handling
suppressSparkErrors();
setupSparkEnvironment();


function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Componente essencial para comunicação com GitHub Spark */}
      <SparkBridge />
      {/* Router principal da aplicação */}
      <Router />
    </div>
  );
}

export default App;