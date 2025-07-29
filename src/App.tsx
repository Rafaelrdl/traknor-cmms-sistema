import './index.css';

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
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-muted-foreground">
              ✅ PostCSS configurado corretamente
            </p>
            <p className="text-muted-foreground">
              ✅ TailwindCSS v3.4.17 funcionando
            </p>
            <p className="text-muted-foreground">
              ✅ Autoprefixer instalado
            </p>
            <p className="text-muted-foreground">
              ✅ Sistema pronto para desenvolvimento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;