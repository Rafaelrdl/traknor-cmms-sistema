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
import { useDashboardKPIs, useWorkOrders, useEquipment, useSectors, useCompanies } from '@/hooks/useData';

export function Dashboard() {
  const kpis = useDashboardKPIs();
  const [workOrders] = useWorkOrders();
  const [equipment] = useEquipment();
  const [sectors] = useSectors();
  const [companies] = useCompanies();

  // Upcoming maintenance (next 7 days)
  const upcomingMaintenance = equipment.filter(eq => {
    const nextDate = new Date(eq.nextMaintenance);
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return nextDate <= inSevenDays;
  });

  // Mock chart data
  const weeklyData = [
    { day: 'Seg', completed: 3, inProgress: 5, open: 2 },
    { day: 'Ter', completed: 5, inProgress: 4, open: 3 },
    { day: 'Qua', completed: 6, inProgress: 3, open: 4 },
    { day: 'Qui', completed: 4, inProgress: 6, open: 2 },
    { day: 'Sex', completed: 8, inProgress: 2, open: 1 },
    { day: 'Sáb', completed: 2, inProgress: 1, open: 3 },
    { day: 'Dom', completed: 1, inProgress: 2, open: 2 }
  ];

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
          className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py- shadow-sm">
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
                        className="w-6 bg-primary rounded-t"
                        style={{ height: `${day.completed * 8}px` }}
                      />
                      <div 
                        className="w-6 bg-secondary rounded-t"
                        style={{ height: `${day.inProgress * 8}px` }}
                      />
                      <div 
                        className="w-6 bg-accent rounded-t"
                        style={{ height: `${day.open * 8}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded" />
                  <span>Concluído</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded" />
                  <span>Em Atraso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded" />
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
                <div className="relative w-32 h-32">
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{equipment.length}</span>
                    </div>
                  </div>
                  {/* Segments would be calculated and positioned here */}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-sm">Funcionando</span>
                  </div>
                  <span className="text-sm font-medium">
                    {equipment.filter(eq => eq.status === 'FUNCTIONING').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded" />
                    <span className="text-sm">Em Manutenção</span>
                  </div>
                  <span className="text-sm font-medium">
                    {equipment.filter(eq => eq.status === 'MAINTENANCE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-sm">Parado</span>
                  </div>
                  <span className="text-sm font-medium">
                    {equipment.filter(eq => eq.status === 'STOPPED').length}
                  </span>
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
              {upcomingMaintenance.map((eq) => {
                const sector = sectors.find(s => s.id === eq.sectorId);
                const company = companies.find(c => c.id === sector?.companyId);
                
                return (
                  <TableRow key={eq.id}>
                    <TableCell className="font-medium">{eq.tag}</TableCell>
                    <TableCell>{eq.brand} {eq.model}</TableCell>
                    <TableCell>{sector?.name} - {company?.name}</TableCell>
                    <TableCell>
                      {new Date(eq.nextMaintenance).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={eq.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
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