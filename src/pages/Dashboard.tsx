import { PageHeader } from '@/components/PageHeader';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TechnicianPerformanceChart } from '@/components/charts/TechnicianPerformanceChart';
import { 
  ClipboardList, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Activity,
  TrendingUp
} from 'lucide-react';
import { useDashboardKPIs, useChartData } from '@/hooks/useDataTemp';

export function Dashboard() {
  const [kpis] = useDashboardKPIs();
  const [chartData] = useChartData();

  // Dados centralizados do mock
  const weeklyData = chartData?.workOrderEvolution || [];
  const upcomingMaintenance = chartData?.upcomingMaintenance || [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Visão Geral" 
      />
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="OS em Aberto"
          value={kpis?.openWorkOrders || 0}
          icon={<ClipboardList className="h-4 w-4" />}
          variant="default"
        />
        <KPICard
          title="OS em Atraso"
          value={kpis?.overdueWorkOrders || 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant={(kpis?.overdueWorkOrders || 0) > 0 ? "danger" : "success"}
        />
        <KPICard
          title="Equipamentos Críticos"
          value={kpis?.criticalEquipment || 0}
          icon={<AlertCircle className="h-4 w-4" />}
          variant={(kpis?.criticalEquipment || 0) > 0 ? "warning" : "success"}
        />
        <KPICard
          title="MTTR"
          value={`${kpis?.mttr || 0}h`}
          icon={<Clock className="h-4 w-4" />}
          trend="down"
          trendValue="2h menos que o mês anterior"
          variant="success"
        />
        <KPICard
          title="MTBF"
          value={`${kpis?.mtbf || 0}h`}
          icon={<Activity className="h-4 w-4" />}
          trend="up"
          trendValue="5h mais que o mês anterior"
          variant="success"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* OS Evolution Chart */}
        <Card
          className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução de OS por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple chart representation */}
              <div className="flex items-end justify-between h-40 border-b border-border">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-6 rounded-t"
                        style={{ height: `${day.completed * 8}px`, backgroundColor: 'var(--primary)' }}
                      />
                      <div 
                        className="w-6 rounded-t"
                        style={{ height: `${day.inProgress * 8}px`, backgroundColor: 'var(--destructive)' }}
                      />
                      <div 
                        className="w-6 rounded-t"
                        style={{ height: `${day.open * 8}px`, backgroundColor: 'var(--secondary)' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--primary)' }} />
                  <span>Concluído</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--destructive)' }} />
                  <span>Em Atraso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--secondary)' }} />
                  <span>Aberto</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Donut chart representation */}
              <div className="flex items-center justify-center">
                {(() => {
                  const equipmentStatus = chartData?.equipmentStatus || { functioning: 0, maintenance: 0, stopped: 0 };
                  const total = equipmentStatus.functioning + 
                               equipmentStatus.maintenance + 
                               equipmentStatus.stopped;
                  
                  if (total === 0) return <div className="text-muted-foreground">Sem dados disponíveis</div>;
                  
                  // Calculate percentages
                  const functioningPercent = (equipmentStatus.functioning / total) * 100;
                  const maintenancePercent = (equipmentStatus.maintenance / total) * 100;
                  const stoppedPercent = (equipmentStatus.stopped / total) * 100;
                  
                  // Calculate stroke-dasharray for each segment
                  const circumference = 2 * Math.PI * 40; // radius = 40
                  const functioningLength = (functioningPercent / 100) * circumference;
                  const maintenanceLength = (maintenancePercent / 100) * circumference;
                  const stoppedLength = (stoppedPercent / 100) * circumference;
                  
                  return (
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="rgb(229 231 235)"
                          strokeWidth="10"
                        />
                        
                        {/* Functioning segment (teal) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#006b76"
                          strokeWidth="10"
                          strokeDasharray={`${functioningLength} ${circumference}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                        
                        {/* Maintenance segment (yellow) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="rgb(234 179 8)"
                          strokeWidth="10"
                          strokeDasharray={`${maintenanceLength} ${circumference}`}
                          strokeDashoffset={-functioningLength}
                          strokeLinecap="round"
                        />
                        
                        {/* Stopped segment (red) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="var(--destructive)"
                          strokeWidth="10"
                          strokeDasharray={`${stoppedLength} ${circumference}`}
                          strokeDashoffset={-(functioningLength + maintenanceLength)}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Center number */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {total}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--primary)' }} />
                    <span className="text-sm">Funcionando</span>
                  </div>
                  <span className="text-sm font-medium">
                    {chartData?.equipmentStatus?.functioning || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded" />
                    <span className="text-sm">Em Manutenção</span>
                  </div>
                  <span className="text-sm font-medium">
                    {chartData?.equipmentStatus?.maintenance || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--destructive)' }} />
                    <span className="text-sm">Parado</span>
                  </div>
                  <span className="text-sm font-medium">
                    {chartData?.equipmentStatus?.stopped || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technician Performance Chart */}
      <TechnicianPerformanceChart />

      {/* Upcoming Maintenance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Manutenções (7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingMaintenance.map((maintenance) => (
                <TableRow key={maintenance.id}>
                  <TableCell className="font-medium">{maintenance.equipmentName}</TableCell>
                  <TableCell>{maintenance.type}</TableCell>
                  <TableCell>Setor Principal</TableCell>
                  <TableCell>
                    {new Date(maintenance.scheduledDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={maintenance.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                      {maintenance.priority === 'HIGH' ? 'Alta' : 'Média'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {upcomingMaintenance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma manutenção programada para os próximos 7 dias
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}