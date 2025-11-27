/**
 * MaintenancePage - Página de Manutenção Integrada
 * 
 * Integração entre monitoramento IoT e ordens de serviço CMMS.
 */

import { Wrench, AlertTriangle, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MaintenanceAlert {
  id: string;
  assetName: string;
  assetId: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  suggestedAction: string;
  detectedAt: string;
  hasWorkOrder: boolean;
  workOrderId?: string;
}

const maintenanceAlerts: MaintenanceAlert[] = [
  {
    id: '1',
    assetName: 'Chiller 01 - Bloco A',
    assetId: 'CHLR-001',
    issue: 'Temperatura de descarga acima do normal',
    severity: 'high',
    suggestedAction: 'Verificar nível de refrigerante e possível vazamento',
    detectedAt: '2024-01-15T10:30:00',
    hasWorkOrder: false
  },
  {
    id: '2',
    assetName: 'Fan Coil 15 - Sala 302',
    assetId: 'FC-015',
    issue: 'Vibração anormal detectada',
    severity: 'medium',
    suggestedAction: 'Inspeção de rolamentos e alinhamento',
    detectedAt: '2024-01-15T09:15:00',
    hasWorkOrder: true,
    workOrderId: 'OS-2024-0123'
  },
  {
    id: '3',
    assetName: 'Bomba de Água Gelada 02',
    assetId: 'BAG-002',
    issue: 'Consumo energético 15% acima da média',
    severity: 'low',
    suggestedAction: 'Verificar eficiência do motor e possível obstrução',
    detectedAt: '2024-01-15T08:00:00',
    hasWorkOrder: false
  }
];

export function MaintenancePage() {
  const navigate = useNavigate();

  const handleCreateWorkOrder = (alert: MaintenanceAlert) => {
    // Navegar para CMMS com contexto do alerta
    navigate(`/cmms/work-orders/new?assetId=${alert.assetId}&issue=${encodeURIComponent(alert.issue)}`);
  };

  const handleViewWorkOrder = (workOrderId: string) => {
    navigate(`/cmms/work-orders/${workOrderId}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Crítico';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return severity;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manutenção Preditiva"
        description="Alertas de manutenção baseados em telemetria e integração com CMMS"
        icon={<Wrench className="h-6 w-6" />}
      >
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => navigate('/cmms/work-orders')}
        >
          Ver Todas as OS
          <ArrowRight className="w-4 h-4" />
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 nas últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OS Geradas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              67% dos alertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">
              Alerta → OS criada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45k</div>
            <p className="text-xs text-muted-foreground">
              Estimado no mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Alertas de Manutenção</h2>
            <p className="text-sm text-muted-foreground">
              Ações sugeridas baseadas em análise de telemetria
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {maintenanceAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{alert.assetName}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {alert.assetId}
                      </Badge>
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                    </div>
                    <CardDescription>{alert.issue}</CardDescription>
                  </div>
                  {alert.hasWorkOrder ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewWorkOrder(alert.workOrderId!)}
                    >
                      Ver OS #{alert.workOrderId}
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleCreateWorkOrder(alert)}
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      Criar OS
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Ação Sugerida:</p>
                      <p className="text-sm text-muted-foreground">{alert.suggestedAction}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Detectado em {new Date(alert.detectedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Como funciona a Manutenção Preditiva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            O sistema analisa continuamente os dados de telemetria dos equipamentos (temperatura, vibração, 
            consumo energético, etc.) e compara com padrões históricos e limites operacionais.
          </p>
          <p className="text-sm text-muted-foreground">
            Quando anomalias são detectadas, alertas de manutenção são gerados automaticamente com sugestões 
            de ação. Você pode então criar uma Ordem de Serviço no CMMS com um clique, mantendo o histórico 
            completo da manutenção vinculado aos dados de monitoramento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
