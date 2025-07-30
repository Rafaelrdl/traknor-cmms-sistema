import './index.css';
import { suppressSparkErrors } from './utils/suppressSparkErrors';
import { setupSparkEnvironment } from './utils/sparkEnvironment';

// Setup Spark environment handling
suppressSparkErrors();
setupSparkEnvironment();

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-primary">TrakNor CMMS</h1>
          <p className="text-xl text-muted-foreground">
            Sistema de Gestão de Manutenção HVAC
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-muted-foreground">
              Sistema de gestão de manutenção preventiva e corretiva para equipamentos HVAC
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-2">Características</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ Multi-tenant (SaaS)</li>
                  <li>✅ Normas PMOC brasileiras</li>
                  <li>✅ Interface responsiva</li>
                  <li>✅ Gestão completa de ativos</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-2">Tecnologias</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ React 19 + TypeScript</li>
                  <li>✅ TailwindCSS v4.0.17</li>
                  <li>✅ Vite + Spark para build</li>
                  <li>✅ Shadcn/ui componentes</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 p-4 bg-card rounded-lg border">
              <p className="text-sm text-muted-foreground">
                ✅ Aplicação funcionando corretamente no GitHub Spark
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;