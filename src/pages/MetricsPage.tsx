import { PageHeader } from '@/components/PageHeader';
import { KPICard } from '@/components/KPICard';
import { MTTRBySectorChart, BacklogTrendChart } from '@/components/charts';
import { MetricsToolbar } from '@/components/metrics/MetricsToolbar';
import { useMetrics } from '@/hooks/useMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle, Target, TrendingUp, BarChart3, Loader2 } from 'lucide-react';

export function MetricsPage() {
  const {
    metrics,
    isLoading,
    isError,
    selectedRange,
    changeRange,
    exportCSV,
    exportPDF,
    refetch
  } = useMetrics('90d');

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Métricas" 
          description="Indicadores de desempenho e análise de tendências"
        />
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-medium mb-2 text-foreground">Erro ao carregar métricas</h3>
              <p className="mb-4">Não foi possível carregar os dados de métricas.</p>
              <button 
                onClick={() => refetch()}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 metrics-content">
      <div className="no-print">
        <PageHeader 
          title="Métricas" 
          description="Indicadores de desempenho e análise de tendências"
        />
        
        <MetricsToolbar
          selectedRange={selectedRange}
          onRangeChange={changeRange}
          onExportCSV={exportCSV}
          onExportPDF={exportPDF}
          isLoading={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* Loading KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="kpi-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                    <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded animate-pulse mb-2 w-16"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Loading Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="chart-container">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-6 bg-muted rounded animate-pulse w-32"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* Period Info (Print Only) */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Relatório de Métricas - TrakNor CMMS</h1>
            <p className="text-muted-foreground">
              Período: {metrics.period} | 
              Gerado em: {new Date(metrics.generated_at).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="MTTR Médio"
              value={`${metrics.kpis.mttr_hours}h`}
              icon={<Clock className="h-4 w-4" />}
              variant={metrics.kpis.mttr_hours > 48 ? 'warning' : 'success'}
            />
            
            <KPICard
              title="Backlog"
              value={`${metrics.kpis.backlog_percent}%`}
              icon={<AlertTriangle className="h-4 w-4" />}
              variant={
                metrics.kpis.backlog_percent > 30 ? 'danger' : 
                metrics.kpis.backlog_percent > 15 ? 'warning' : 'success'
              }
            />
            
            <KPICard
              title="Top Ativo (OS)"
              value={metrics.kpis.top_asset_by_os?.count.toString() || '0'}
              icon={<Target className="h-4 w-4" />}
              variant="default"
            />
            
            <KPICard
              title="Preventivas no Prazo"
              value={`${metrics.kpis.preventive_on_time_percent}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              variant={
                metrics.kpis.preventive_on_time_percent >= 90 ? 'success' :
                metrics.kpis.preventive_on_time_percent >= 75 ? 'warning' : 'danger'
              }
            />
          </div>

          {/* Additional KPI Details (Print Only) */}
          <div className="hidden print:block">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Detalhes dos Indicadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>MTTR (Mean Time To Repair):</strong> {metrics.kpis.mttr_hours} horas
                    <br />
                    <span className="text-muted-foreground">
                      Tempo médio para reparo de ordens corretivas
                    </span>
                  </div>
                  <div>
                    <strong>Backlog:</strong> {metrics.kpis.backlog_percent}% de OS em aberto
                    <br />
                    <span className="text-muted-foreground">
                      Percentual de ordens de serviço não concluídas
                    </span>
                  </div>
                  <div>
                    <strong>Top Ativo por OS:</strong> {metrics.kpis.top_asset_by_os?.asset_name || 'N/A'}
                    <br />
                    <span className="text-muted-foreground">
                      {metrics.kpis.top_asset_by_os?.count || 0} ordens de serviço no período
                    </span>
                  </div>
                  <div>
                    <strong>Preventivas no Prazo:</strong> {metrics.kpis.preventive_on_time_percent}%
                    <br />
                    <span className="text-muted-foreground">
                      Ordens preventivas concluídas dentro do prazo
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="chart-container">
              <MTTRBySectorChart 
                data={metrics.charts.mttr_by_sector}
                srDescriptionId="mttr-sector-chart"
              />
            </div>
            
            <div className="chart-container">
              <BacklogTrendChart 
                data={metrics.charts.backlog_percent_monthly}
                srDescriptionId="backlog-trend-chart"
              />
            </div>
          </div>

          {/* Screen reader descriptions for charts */}
          <div className="sr-only">
            <div id="mttr-sector-chart">
              Gráfico de barras mostrando o MTTR (tempo médio de reparo) por setor. 
              {metrics.charts.mttr_by_sector.length > 0 ? (
                metrics.charts.mttr_by_sector.map(sector => 
                  `${sector.sector_name}: ${sector.mttr_hours} horas baseado em ${sector.wo_count} ordens de serviço. `
                ).join('')
              ) : 'Nenhum dado disponível.'}
            </div>
            
            <div id="backlog-trend-chart">
              Gráfico de linha mostrando a evolução do backlog ao longo do tempo. 
              {metrics.charts.backlog_percent_monthly.length > 0 ? (
                metrics.charts.backlog_percent_monthly.map(period => 
                  `${period.month}: ${period.backlog_percent}% de backlog. `
                ).join('')
              ) : 'Nenhum dado disponível.'}
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2 text-foreground">Nenhum dado encontrado</h3>
              <p>Não há dados de métricas disponíveis para o período selecionado.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}