/**
 * EquipmentRealtime - Visualização em tempo real de equipamento
 * 
 * Mostra dados ao vivo de um equipamento específico:
 * - Métricas em tempo real
 * - Gráficos de histórico
 * - Status de sensores
 * - Ações rápidas
 */

import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, StatCard, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Thermometer, 
  Droplets,
  Gauge,
  Zap,
  Wifi,
  Clock,
  Settings,
  Bell,
  Activity,
  RefreshCw,
  Power,
  TrendingUp,
  Wrench,
  ClipboardList,
  ExternalLink
} from 'lucide-react';

export function EquipmentRealtime() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dados mockados para demonstração
  const equipment = {
    id: id || 'chiller-001',
    assetId: 'asset-001', // ID do ativo no CMMS
    name: 'Chiller Principal',
    type: 'Chiller',
    model: 'Carrier 30XA-282',
    location: 'Casa de Máquinas - Subsolo',
    status: 'online',
    lastUpdate: '2 segundos atrás',
    hasOpenWorkOrders: 2, // Quantidade de OS abertas
    sensors: [
      { name: 'Temp. Entrada', value: '12.3°C', status: 'normal' },
      { name: 'Temp. Saída', value: '7.2°C', status: 'normal' },
      { name: 'Pressão Alta', value: '18.5 bar', status: 'warning' },
      { name: 'Pressão Baixa', value: '4.2 bar', status: 'normal' },
      { name: 'Corrente', value: '45.2 A', status: 'normal' },
      { name: 'Umidade', value: '65%', status: 'normal' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/monitor')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title={equipment.name}
        description={`${equipment.type} • ${equipment.model}`}
        icon={<Gauge className="h-6 w-6" />}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={equipment.status === 'online' ? 'default' : 'secondary'}>
            <Wifi className="h-3 w-3 mr-1" />
            {equipment.status === 'online' ? 'Online' : 'Offline'}
          </Badge>
          
          {/* Botão de navegação cruzada para CMMS */}
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => navigate(`/cmms/ativos/${equipment.assetId}`)}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Ver OS desse ativo
            {equipment.hasOpenWorkOrders > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100">
                {equipment.hasOpenWorkOrders}
              </Badge>
            )}
          </Button>
          
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Configurar Alertas
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </PageHeader>

      {/* Info Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Última atualização: {equipment.lastUpdate}
          </span>
          <span>|</span>
          <span>{equipment.location}</span>
        </div>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Temperatura Saída"
          value="7.2°C"
          description="Setpoint: 7.0°C"
          icon={<Thermometer className="h-5 w-5" />}
        />
        <StatCard
          title="Carga Térmica"
          value="78%"
          description="Capacidade nominal"
          icon={<Gauge className="h-5 w-5" />}
          trend="up"
          trendValue="+3%"
          trendColor="neutral"
        />
        <StatCard
          title="Consumo Atual"
          value="125.4 kW"
          description="COP: 4.2"
          icon={<Zap className="h-5 w-5" />}
        />
        <StatCard
          title="Tempo Ligado"
          value="847h"
          description="Este mês"
          icon={<Power className="h-5 w-5" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensores em Tempo Real */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sensores em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {equipment.sensors.map((sensor, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    sensor.status === 'warning' 
                      ? 'border-amber-300 bg-amber-50' 
                      : sensor.status === 'critical'
                      ? 'border-red-300 bg-red-50'
                      : 'border-border bg-card'
                  }`}
                >
                  <p className="text-sm text-muted-foreground mb-1">{sensor.name}</p>
                  <p className="text-2xl font-bold">{sensor.value}</p>
                  {sensor.status !== 'normal' && (
                    <Badge 
                      variant={sensor.status === 'warning' ? 'secondary' : 'destructive'}
                      className="mt-2"
                    >
                      {sensor.status === 'warning' ? 'Atenção' : 'Crítico'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Histórico Completo
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Regras de Alerta
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Parâmetros
            </Button>
            <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-300 hover:bg-amber-50">
              <Power className="h-4 w-4 mr-2" />
              Comando Remoto
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico de Temperatura (Últimas 6h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de histórico será renderizado aqui</p>
              <p className="text-xs mt-1">Componente Recharts a ser migrado do TrakSense</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner de Navegação para CMMS */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Gestão de Manutenção</h3>
                <p className="text-sm text-blue-600">
                  Acesse o TrakNor CMMS para ver ordens de serviço, histórico e planos de manutenção
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => navigate(`/cmms/ativos/${equipment.assetId}`)}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Ver Ativo no CMMS
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/cmms/work-orders/new?assetId=' + equipment.assetId)}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Criar Ordem de Serviço
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
