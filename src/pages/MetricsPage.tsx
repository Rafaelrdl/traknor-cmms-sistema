import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function MetricsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Métricas e Indicadores" 
        description="KPIs e análises de desempenho da manutenção"
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Indicadores de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
            <p>Relatórios avançados e métricas detalhadas estarão disponíveis em breve.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}