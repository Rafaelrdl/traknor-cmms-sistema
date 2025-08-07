import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useChartData } from '@/hooks/useDataTemp';
import type { TechnicianPerformance } from '@/types';

export function TechnicianPerformanceChart() {
  const [chartData] = useChartData();
  const technicianData = chartData?.technicianPerformance || [];

  // Calculate max value for scaling bars
  const maxValue = technicianData.reduce((max, tech) => {
    const total = tech.preventive + tech.corrective + tech.request;
    return Math.max(max, total);
  }, 0);

  // Generate aria-label for accessibility
  const totalWorkOrders = technicianData.reduce((sum, tech) => 
    sum + tech.preventive + tech.corrective + tech.request, 0
  );
  
  const ariaLabel = `Gráfico de desempenho dos técnicos. Total de ${totalWorkOrders} ordens de serviço. 
    ${technicianData.map(tech => 
      `${tech.name}: ${tech.preventive + tech.corrective + tech.request} ordens`
    ).join(', ')}.`;

  if (technicianData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Desempenho por Técnico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de desempenho disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Desempenho por Técnico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart bars */}
          <div className="space-y-4">
            {technicianData.map((tech, index) => {
              const total = tech.preventive + tech.corrective + tech.request;
              const preventiveWidth = maxValue > 0 ? (tech.preventive / maxValue) * 100 : 0;
              const correctiveWidth = maxValue > 0 ? (tech.corrective / maxValue) * 100 : 0;
              const requestWidth = maxValue > 0 ? (tech.request / maxValue) * 100 : 0;
              
              return (
                <div key={tech.name} className="space-y-2">
                  {/* Technician name and total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {tech.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium ml-2">
                      {total}
                    </span>
                  </div>
                  
                  {/* Stacked horizontal bar */}
                  <div 
                    className="relative h-6 bg-muted/30 rounded-md overflow-hidden"
                    role="progressbar" 
                    aria-label={`${tech.name}: ${total} ordens de serviço total`}
                    tabIndex={0}
                  >
                    {/* Preventive segment */}
                    {tech.preventive > 0 && (
                      <div
                        className="absolute left-0 top-0 h-full rounded-l-md transition-all duration-300"
                        style={{
                          width: `${preventiveWidth}%`,
                          backgroundColor: '#00968f'
                        }}
                        title={`Preventiva: ${tech.preventive}`}
                      />
                    )}
                    
                    {/* Corrective segment */}
                    {tech.corrective > 0 && (
                      <div
                        className="absolute top-0 h-full transition-all duration-300"
                        style={{
                          left: `${preventiveWidth}%`,
                          width: `${correctiveWidth}%`,
                          backgroundColor: '#ffbe0b'
                        }}
                        title={`Corretiva: ${tech.corrective}`}
                      />
                    )}
                    
                    {/* Request segment */}
                    {tech.request > 0 && (
                      <div
                        className="absolute top-0 h-full rounded-r-md transition-all duration-300"
                        style={{
                          left: `${preventiveWidth + correctiveWidth}%`,
                          width: `${requestWidth}%`,
                          backgroundColor: '#715aff'
                        }}
                        title={`Solicitação: ${tech.request}`}
                      />
                    )}
                    
                    {/* Accessible text for screen readers */}
                    <span className="sr-only">
                      {tech.name}: {tech.preventive} preventivas, {tech.corrective} corretivas, {tech.request} solicitações
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: '#00968f' }}
              />
              <span className="text-sm text-foreground">Preventiva</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: '#ffbe0b' }}
              />
              <span className="text-sm text-foreground">Corretiva</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: '#715aff' }}
              />
              <span className="text-sm text-foreground">Solicitação</span>
            </div>
          </div>
        </div>
        
        {/* Hidden accessible description */}
        <div 
          role="img" 
          aria-label={ariaLabel}
          className="sr-only"
        />
      </CardContent>
    </Card>
  );
}