import { PageHeader } from '@/components/PageHeader';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  ClipboardList, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Activity,
  TrendingUp
} from 'lucide-react';
import { useDashboardKPIs, useWorkOrders, useEquipment, useSectors, useCompanies, useChartData } from '@/hooks/useData';

export function Dashboard() {
  const [kpis] = useDashboardKPIs();
  const [workOrders] = useWorkOrders();
  const [equipment] = useEquipment();
  const [sectors] = useSectors();
  const [companies] = useCompanies();
  const [chartData] = useChartData();

  // Dados centralizados do mock
  const weeklyData = chartData.workOrderEvolution;
  const upcomingMaintenance = chartData.upcomingMaintenance;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Visão Geral" 
        description="Dashboard do sistema de gestão de manutenção HVAC"
      />
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="OS em Aberto"
          value={kpis.openWorkOrders}
          icon={<ClipboardList className="h-4 w-4" />}
          variant="default"
        />
        <KPICard
          title="OS em Atraso"
          value={kpis.overdueWorkOrders}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant={kpis.overdueWorkOrders > 0 ? "danger" : "success"}
        />
        <KPICard
          title="Equipamentos Críticos"
          value={kpis.criticalEquipment}
          icon={<AlertCircle className="h-4 w-4" />}
          variant={kpis.criticalEquipment > 0 ? "warning" : "success"}
        />
        <KPICard
          title="MTTR"
          value={`${kpis.mttr}h`}
          icon={<Clock className="h-4 w-4" />}
          trend="down"
          trendValue="2h menos que o mês anterior"
          variant="success"
        />
        <KPICard
          title="MTBF"
          value={`${kpis.mtbf}h`}
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
                {weeklyData.map((day, index) => (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-6 rounded-t"
                        style={{ height: `${day.completed * 8}px`, backgroundColor: '#006b76' }}
                      />
                      <div 
                        className="w-6 rounded-t"
                        style={{ height: `${day.inProgress * 8}px`, backgroundColor: '#ff5b5b' }}
                      />
                      <div 
                        className="w-6 rounded-t"
                        style={{ height: `${day.open * 8}px`, backgroundColor: '#e0f3f4' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#006b76' }} />
                  <span>Concluído</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ff5b5b' }} />
                  <span>Em Atraso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#e0f3f4' }} />
                  <span>Aberto</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Equipment Status */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
              Status dos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Enhanced Donut chart representation */}
              <div className="flex items-center justify-center">
                {(() => {
                  const total = chartData.equipmentStatus.functioning + 
                               chartData.equipmentStatus.maintenance + 
                               chartData.equipmentStatus.stopped;
                  
                  // Calculate percentages
                  const functioningPercent = (chartData.equipmentStatus.functioning / total) * 100;
                  const maintenancePercent = (chartData.equipmentStatus.maintenance / total) * 100;
                  const stoppedPercent = (chartData.equipmentStatus.stopped / total) * 100;
                  
                  // Calculate stroke-dasharray for each segment
                  const circumference = 2 * Math.PI * 45; // increased radius for better visual
                  const functioningLength = (functioningPercent / 100) * circumference;
                  const maintenanceLength = (maintenancePercent / 100) * circumference;
                  const stoppedLength = (stoppedPercent / 100) * circumference;
                  
                  return (
                    <div className="relative w-40 h-40">
                      {/* Subtle shadow backdrop */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 opacity-20 blur-sm"></div>
                      
                      <svg className="w-40 h-40 transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="functioning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="maintenance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                          <linearGradient id="stopped-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                          
                          {/* Glow filters */}
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                            <feMerge> 
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Background circle with subtle gradient */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="rgb(243 244 246)"
                          strokeWidth="8"
                        />
                        
                        {/* Functioning segment with gradient and animation */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="url(#functioning-gradient)"
                          strokeWidth="8"
                          strokeDasharray={`${functioningLength} ${circumference}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          filter="url(#glow)"
                          className="transition-all duration-1000 ease-out animate-in"
                        />
                        
                        {/* Maintenance segment with gradient and animation */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="url(#maintenance-gradient)"
                          strokeWidth="8"
                          strokeDasharray={`${maintenanceLength} ${circumference}`}
                          strokeDashoffset={-functioningLength}
                          strokeLinecap="round"
                          filter="url(#glow)"
                          className="transition-all duration-1000 ease-out animate-in"
                          style={{ animationDelay: '0.2s' }}
                        />
                        
                        {/* Stopped segment with gradient and animation */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="url(#stopped-gradient)"
                          strokeWidth="8"
                          strokeDasharray={`${stoppedLength} ${circumference}`}
                          strokeDashoffset={-(functioningLength + maintenanceLength)}
                          strokeLinecap="round"
                          filter="url(#glow)"
                          className="transition-all duration-1000 ease-out animate-in"
                          style={{ animationDelay: '0.4s' }}
                        />
                      </svg>
                      
                      {/* Enhanced center display with hover state */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <div className="text-center bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg border border-gray-100">
                          <span className="text-3xl font-bold text-gray-900 block leading-none">
                            {total}
                          </span>
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Equipamentos
                          </span>
                        </div>
                      </div>
                      
                      {/* Interactive hover overlay */}
                      <div className="absolute inset-0 rounded-full transition-all duration-300 hover:scale-105 cursor-pointer group"></div>
                    </div>
                  );
                })()}
              </div>
              {/* Enhanced Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between group hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm"></div>
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-40 animate-pulse"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Funcionando</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {chartData.equipmentStatus.functioning}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {((chartData.equipmentStatus.functioning / (chartData.equipmentStatus.functioning + chartData.equipmentStatus.maintenance + chartData.equipmentStatus.stopped)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between group hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm"></div>
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Em Manutenção</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {chartData.equipmentStatus.maintenance}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {((chartData.equipmentStatus.maintenance / (chartData.equipmentStatus.functioning + chartData.equipmentStatus.maintenance + chartData.equipmentStatus.stopped)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between group hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm"></div>
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Parado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {chartData.equipmentStatus.stopped}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {((chartData.equipmentStatus.stopped / (chartData.equipmentStatus.functioning + chartData.equipmentStatus.maintenance + chartData.equipmentStatus.stopped)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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