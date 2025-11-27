/**
 * MonitorDashboard - Dashboard principal do TrakSense Monitor
 * 
 * Visão geral do monitoramento em tempo real com:
 * - Cards de status dos equipamentos
 * - Alertas ativos
 * - Gráficos de tendência
 */

import { PageHeader, StatCard, EmptyState, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Thermometer, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  TrendingUp,
  TrendingDown,
  Gauge,
  Zap
} from 'lucide-react';

export function MonitorDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoramento em Tempo Real"
        description="Acompanhe o status dos equipamentos e alertas do sistema"
        icon={<Activity className="h-6 w-6" />}
      >
        <Button variant="outline" size="sm">
          <Wifi className="h-4 w-4 mr-2" />
          Status Conexão
        </Button>
      </PageHeader>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Equipamentos Online"
          value={24}
          description="de 28 total"
          icon={<Wifi className="h-5 w-5" />}
          trend="up"
          trendValue="86%"
          trendColor="positive"
        />
        <StatCard
          title="Alertas Ativos"
          value={3}
          description="2 críticos, 1 aviso"
          icon={<AlertTriangle className="h-5 w-5" />}
          trend="down"
          trendValue="-2"
          trendColor="positive"
        />
        <StatCard
          title="Temperatura Média"
          value="22.5°C"
          description="Dentro do esperado"
          icon={<Thermometer className="h-5 w-5" />}
        />
        <StatCard
          title="Consumo Energético"
          value="847 kWh"
          description="Últimas 24h"
          icon={<Zap className="h-5 w-5" />}
          trend="up"
          trendValue="+5%"
          trendColor="negative"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipamentos em Destaque */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Equipamentos Monitorados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placeholder Equipment Cards */}
              {[
                { name: 'Chiller Principal', status: 'online', temp: '7.2°C', load: '78%' },
                { name: 'Fan Coil - Sala 1', status: 'online', temp: '22.1°C', load: '45%' },
                { name: 'Condensadora Externa', status: 'warning', temp: '38.5°C', load: '92%' },
                { name: 'Split - Recepção', status: 'offline', temp: '--', load: '--' },
              ].map((eq, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{eq.name}</span>
                    <span className={`flex items-center gap-1 text-xs ${
                      eq.status === 'online' ? 'text-green-600' :
                      eq.status === 'warning' ? 'text-amber-600' :
                      'text-gray-400'
                    }`}>
                      {eq.status === 'online' ? <Wifi className="h-3 w-3" /> :
                       eq.status === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                       <WifiOff className="h-3 w-3" />}
                      {eq.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      {eq.temp}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {eq.load}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Ver todos os equipamentos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alertas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'critical', message: 'Temperatura alta - Condensadora', time: '5 min' },
                { type: 'critical', message: 'Consumo acima do limite', time: '12 min' },
                { type: 'warning', message: 'Sensor desconectado - Sala 3', time: '1h' },
              ].map((alert, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' 
                      ? 'border-l-red-500 bg-red-50' 
                      : 'border-l-amber-500 bg-amber-50'
                  }`}
                >
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">há {alert.time}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Ver todos os alertas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendência de Temperatura (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de temperatura será renderizado aqui</p>
              <p className="text-xs mt-1">Componente Recharts a ser migrado do TrakSense</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
