import { PageHeader } from '@/components/PageHeader';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TechnicianPerformanceChart } from '@/components/charts/TechnicianPerformanceChart';
import { DataFilterInfo } from '@/components/data/FilteredDataProvider';
import { OnboardingProgressCard } from '@/components/onboarding/OnboardingProgressCard';
import { 
  ClipboardList, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Activity,
  TrendingUp,
  User
} from 'lucide-react';
import { useDashboardKPIs, useChartData } from '@/hooks/useDataTemp';
import { useDashboardFiltering } from '@/hooks/useDashboardFiltering';
import { useAbility } from '@/hooks/useAbility';
import { useMemo } from 'react';

export function Dashboard() {
  const [kpis] = useDashboardKPIs();
  const [chartData] = useChartData();
  const { role } = useAbility();
  const {
    filterDashboard,
    getDashboardConfig,
    getDashboardDescription,
    getAvailableWidgets
  } = useDashboardFiltering();

  // Get dashboard configuration based on role
  const dashboardConfig = getDashboardConfig();
  const availableWidgets = getAvailableWidgets();

  // Create mock dashboard data and apply role-based filtering
  const dashboardData = useMemo(() => {
    const mockData = {
      kpis: [
        { key: 'openWorkOrders', value: kpis?.openWorkOrders || 0, label: 'OS em Aberto', sensitive: false },
        { key: 'overdueWorkOrders', value: kpis?.overdueWorkOrders || 0, label: 'OS em Atraso', sensitive: false },
        { key: 'criticalEquipment', value: kpis?.criticalEquipment || 0, label: 'Equipamentos Críticos', sensitive: false },
        { key: 'mttr', value: kpis?.mttr || 0, label: 'MTTR', sensitive: false },
        { key: 'mtbf', value: kpis?.mtbf || 0, label: 'MTBF', sensitive: false },
        // Role-specific KPIs
        ...(role === 'admin' ? [
          { key: 'totalCost', value: 25000, label: 'Custo Total', sensitive: true },
          { key: 'budgetUtilization', value: 78, label: 'Utilização do Orçamento (%)', sensitive: true }
        ] : []),
        ...(role === 'technician' ? [
          { key: 'myAssignedWork', value: 8, label: 'Minhas OS', sensitive: false },
          { key: 'completedThisWeek', value: 12, label: 'Concluídas esta semana', sensitive: false }
        ] : []),
        ...(role === 'requester' ? [
          { key: 'myRequests', value: 3, label: 'Minhas Solicitações', sensitive: false },
          { key: 'pendingApprovals', value: 1, label: 'Aguardando Aprovação', sensitive: false }
        ] : [])
      ],
      workOrdersOverTime: chartData?.workOrderEvolution?.map((item: any) => ({
        label: item.day,
        value: item.completed + item.inProgress + item.open,
        category: 'workorders'
      })) || [],
      assetStatus: [
        { label: 'Funcionando', value: chartData?.equipmentStatus?.functioning || 0, category: 'assets' },
        { label: 'Em Manutenção', value: chartData?.equipmentStatus?.maintenance || 0, category: 'assets' },
        { label: 'Parado', value: chartData?.equipmentStatus?.stopped || 0, category: 'assets' }
      ],
      technicianPerformance: [], // Empty for now
      maintenanceMetrics: {
        mttr: kpis?.mttr || 0,
        mtbf: kpis?.mtbf || 0,
        uptime: 95.5,
        costMetrics: role === 'admin' ? {
          totalCost: 25000,
          costPerWorkOrder: 780,
          budgetUtilization: 78
        } : undefined
      },
      upcomingMaintenance: chartData?.upcomingMaintenance || [],
      recentActivity: [] // Would be populated with actual data
    };

    return filterDashboard(mockData);
  }, [kpis, chartData, role, filterDashboard]);

  // Dados centralizados do mock (filtered)
  const weeklyData = chartData?.workOrderEvolution || [];
  const upcomingMaintenance = dashboardData.upcomingMaintenance || [];
  const filteredKPIs = dashboardData.kpis || [];

  // Calculate filter stats for display
  const filterStats = {
    total: (kpis?.openWorkOrders || 0) + (chartData?.upcomingMaintenance?.length || 0),
    visible: upcomingMaintenance.length + (filteredKPIs.length || 0),
    filtered: 0
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={dashboardConfig.title}
        description={getDashboardDescription()}
      />
      
      {/* Role-based data filtering info */}
      {role !== 'admin' && (
        <DataFilterInfo
          filterStats={filterStats}
          dataType="dashboard"
          canViewAll={false}
          className="mb-4"
        />
      )}

      {/* Onboarding Progress Card for new users */}
      <OnboardingProgressCard />

      {/* KPI Cards - filtered based on role */}
      {availableWidgets.includes('kpis') && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5" data-tour="dashboard-kpis">
        {/* Render KPI cards based on filtered data */}
        {filteredKPIs.map((kpi) => {
          // Determine appropriate icon and variant based on KPI
          let icon = <Activity className="h-4 w-4" />;
          let variant: "default" | "success" | "warning" | "danger" = "default";
          let trend: "up" | "down" | undefined;
          let trendValue: string | undefined;

          switch (kpi.key) {
            case 'openWorkOrders':
              icon = <ClipboardList className="h-4 w-4" />;
              break;
            case 'overdueWorkOrders':
              icon = <AlertTriangle className="h-4 w-4" />;
              variant = typeof kpi.value === 'number' && kpi.value > 0 ? "danger" : "success";
              break;
            case 'criticalEquipment':
              icon = <AlertCircle className="h-4 w-4" />;
              variant = typeof kpi.value === 'number' && kpi.value > 0 ? "warning" : "success";
              break;
            case 'mttr':
              icon = <Clock className="h-4 w-4" />;
              variant = "success";
              trend = "down";
              trendValue = "2h menos que o mês anterior";
              break;
            case 'mtbf':
              icon = <Activity className="h-4 w-4" />;
              variant = "success";
              trend = "up";
              trendValue = "5h mais que o mês anterior";
              break;
            case 'myAssignedWork':
            case 'myRequests':
              icon = <User className="h-4 w-4" />;
              break;
            case 'totalCost':
              icon = <TrendingUp className="h-4 w-4" />;
              variant = "warning";
              break;
          }

          return (
            <KPICard
              key={kpi.key}
              title={kpi.label}
              value={typeof kpi.value === 'number' && kpi.key.includes('Cost') ? 
                `R$ ${kpi.value.toLocaleString()}` : 
                typeof kpi.value === 'number' && kpi.key.includes('Percent') ? 
                  `${kpi.value}%` : 
                  kpi.key.includes('mttr') || kpi.key.includes('mtbf') ? 
                    `${kpi.value}h` : 
                    kpi.value.toString()
              }
              icon={icon}
              variant={variant}
              trend={trend}
              trendValue={trendValue}
            />
          );
        })}
      </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2" data-tour="dashboard-charts">
        {/* OS Evolution Chart - only for admin/technician */}
        {availableWidgets.includes('workOrdersChart') && (
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução de OS por Dia
              {role !== 'admin' && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Filtrado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple chart representation */}
              <div className="flex items-end justify-between h-40 border-b border-border">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex flex-col items-center gap-2 group">
                    <div className="flex flex-col items-center gap-1 relative">
                      {/* Hover tooltip */}
                      <div className="invisible group-hover:visible absolute -top-16 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-xs whitespace-nowrap z-10">
                        <div className="font-medium mb-1">{day.day}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: 'var(--primary)' }}></div>
                            <span>Concluído: {day.completed}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: 'var(--destructive)' }}></div>
                            <span>Em Atraso: {day.inProgress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: 'var(--secondary)' }}></div>
                            <span>Aberto: {day.open}</span>
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
                      </div>
                      
                      <div 
                        className="w-6 rounded-t chart-bar"
                        style={{ 
                          height: `${day.completed * 8}px`, 
                          backgroundColor: 'var(--primary)'
                        }}
                        title={`Concluído: ${day.completed}`}
                      />
                      <div 
                        className="w-6 rounded-t chart-bar"
                        style={{ 
                          height: `${day.inProgress * 8}px`, 
                          backgroundColor: 'var(--destructive)'
                        }}
                        title={`Em Atraso: ${day.inProgress}`}
                      />
                      <div 
                        className="w-6 rounded-t chart-bar"
                        style={{ 
                          height: `${day.open * 8}px`, 
                          backgroundColor: 'var(--secondary)'
                        }}
                        title={`Aberto: ${day.open}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors cursor-pointer group">
                  <div className="w-3 h-3 rounded transition-transform group-hover:scale-110" style={{ backgroundColor: 'var(--primary)' }} />
                  <span className="transition-colors group-hover:text-foreground">Concluído</span>
                </div>
                <div className="flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors cursor-pointer group">
                  <div className="w-3 h-3 rounded transition-transform group-hover:scale-110" style={{ backgroundColor: 'var(--destructive)' }} />
                  <span className="transition-colors group-hover:text-foreground">Em Atraso</span>
                </div>
                <div className="flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors cursor-pointer group">
                  <div className="w-3 h-3 rounded transition-transform group-hover:scale-110" style={{ backgroundColor: 'var(--secondary)' }} />
                  <span className="transition-colors group-hover:text-foreground">Aberto</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Equipment Status - available for all roles but with different data */}
        {availableWidgets.includes('assetStatusChart') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Status dos Ativos
              {role === 'requester' && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Limitado
                </Badge>
              )}
            </CardTitle>
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
                    <div className="relative w-32 h-32 group">
                      {/* Tooltip container - shown dynamically */}
                      <div 
                        id="donut-tooltip"
                        className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-xs whitespace-nowrap z-20 opacity-0 pointer-events-none transition-all duration-200"
                      >
                        <div className="font-medium mb-1" id="tooltip-title"></div>
                        <div id="tooltip-content"></div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
                      </div>

                      <svg 
                        className="w-32 h-32 transform -rotate-90" 
                        viewBox="0 0 100 100"
                        onMouseLeave={() => {
                          const tooltip = document.getElementById('donut-tooltip');
                          if (tooltip) tooltip.style.opacity = '0';
                        }}
                      >
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
                          className="donut-segment"
                          onMouseEnter={() => {
                            const tooltip = document.getElementById('donut-tooltip');
                            const title = document.getElementById('tooltip-title');
                            const content = document.getElementById('tooltip-content');
                            if (tooltip && title && content) {
                              title.textContent = 'Funcionando';
                              content.textContent = `${equipmentStatus.functioning} equipamentos (${functioningPercent.toFixed(1)}%)`;
                              tooltip.style.opacity = '1';
                            }
                          }}
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
                          className="donut-segment"
                          onMouseEnter={() => {
                            const tooltip = document.getElementById('donut-tooltip');
                            const title = document.getElementById('tooltip-title');
                            const content = document.getElementById('tooltip-content');
                            if (tooltip && title && content) {
                              title.textContent = 'Em Manutenção';
                              content.textContent = `${equipmentStatus.maintenance} equipamentos (${maintenancePercent.toFixed(1)}%)`;
                              tooltip.style.opacity = '1';
                            }
                          }}
                        />
                        
                        {/* Stopped segment (red) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#dc2626"
                          strokeWidth="10"
                          strokeDasharray={`${stoppedLength} ${circumference}`}
                          strokeDashoffset={-(functioningLength + maintenanceLength)}
                          strokeLinecap="round"
                          className="donut-segment"
                          onMouseEnter={() => {
                            const tooltip = document.getElementById('donut-tooltip');
                            const title = document.getElementById('tooltip-title');
                            const content = document.getElementById('tooltip-content');
                            if (tooltip && title && content) {
                              title.textContent = 'Parado';
                              content.textContent = `${equipmentStatus.stopped} equipamentos (${stoppedPercent.toFixed(1)}%)`;
                              tooltip.style.opacity = '1';
                            }
                          }}
                        />
                      </svg>
                      
                      {/* Center number */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold transition-colors group-hover:text-primary">
                          {total}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded transition-transform group-hover:scale-110" style={{ backgroundColor: 'var(--primary)' }} />
                    <span className="text-sm transition-colors group-hover:text-foreground">Funcionando</span>
                  </div>
                  <span className="text-sm font-medium">
                    {chartData?.equipmentStatus?.functioning || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded transition-transform group-hover:scale-110" />
                    <span className="text-sm transition-colors group-hover:text-foreground">Em Manutenção</span>
                  </div>
                  <span className="text-sm font-medium">
                    {chartData?.equipmentStatus?.maintenance || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded transition-transform group-hover:scale-110" style={{ backgroundColor: 'var(--destructive)' }} />
                    <span className="text-sm transition-colors group-hover:text-foreground">Parado</span>
                  </div>
                  <span className="text-sm font-medium">
                    {chartData?.equipmentStatus?.stopped || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Technician Performance Chart - only for admin/technician */}
      {availableWidgets.includes('technicianPerformanceChart') && (
        <TechnicianPerformanceChart />
      )}

      {/* Upcoming Maintenance Table - filtered based on role */}
      {availableWidgets.includes('upcomingMaintenance') && (
      <Card data-tour="next-maintenances">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {role === 'requester' ? 'Minhas Solicitações Programadas' : 'Próximas Manutenções (7 dias)'}
            {role !== 'admin' && (
              <Badge variant="outline" className="ml-2 text-xs">
                {role === 'technician' ? 'Minhas' : 'Limitado'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMaintenance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {role === 'requester' 
                ? 'Nenhuma solicitação programada' 
                : role === 'technician' 
                  ? 'Nenhuma manutenção atribuída para os próximos 7 dias'
                  : 'Nenhuma manutenção programada para os próximos 7 dias'
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>
                    {role === 'requester' ? 'Tipo de Solicitação' : 'Equipamento'}
                  </TableHead>
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
                    <TableCell>
                      {role === 'admin' ? 'Setor Principal' : 'Meu Setor'}
                    </TableCell>
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
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}