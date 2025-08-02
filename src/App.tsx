import './index.css';
import { SparkBridge } from './components/SparkBridge';
import { Router } from './Router';

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