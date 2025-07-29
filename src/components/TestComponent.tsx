// Simple test component to verify the build process is working
export function TestComponent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">TrakNor CMMS</h1>
        <p className="text-lg text-muted-foreground">Sistema de Gestão de Manutenção HVAC</p>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        <p className="text-sm text-muted-foreground max-w-md">
          Sistema funcionando corretamente. Todas as dependências PostCSS foram instaladas e configuradas.
        </p>
      </div>
    </div>
  );
}