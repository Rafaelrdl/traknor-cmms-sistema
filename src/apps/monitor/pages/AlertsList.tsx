/**
 * AlertsList - Lista de alertas do sistema de monitoramento
 * 
 * Exibe todos os alertas com:
 * - Filtros por severidade e status
 * - Ações de acknowledge e resolução
 * - Detalhes expandíveis
 * - Navegação cruzada para OS no CMMS
 * 
 * ✅ Integrado com a API real via useAlertsQuery
 */

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader, StatusBadge, Card, CardContent } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertTriangle, 
  AlertCircle,
  Info,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Bell,
  BellOff,
  Thermometer,
  Zap,
  Wifi,
  Wrench,
  ClipboardList,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  useAlertsQuery, 
  useAlertsStatisticsQuery,
  useAcknowledgeAlertMutation,
  useResolveAlertMutation 
} from '../hooks';
import type { Alert, AlertFilters, AlertSeverity } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Retorna a cor do badge de severidade
 */
const getSeverityColor = (severity: AlertSeverity): 'destructive' | 'secondary' | 'outline' => {
  switch (severity) {
    case 'Critical':
      return 'destructive';
    case 'High':
    case 'Medium':
      return 'secondary';
    case 'Low':
    default:
      return 'outline';
  }
};

/**
 * Formata data/hora para exibição
 */
const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
};

export function AlertsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | null>(null);
  const [filterStatus, setFilterStatus] = useState<AlertFilters['status'] | null>(null);

  // Queries para dados reais da API
  const { data: alerts = [], isLoading, isError, refetch } = useAlertsQuery({ status: filterStatus || undefined });
  const { data: statistics } = useAlertsStatisticsQuery();
  
  // Mutations para ações
  const acknowledgeMutation = useAcknowledgeAlertMutation();
  const resolveMutation = useResolveAlertMutation();

  // Filtra alertas localmente (para busca por texto e severidade)
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert: Alert) => {
      const matchesSearch = searchTerm === '' ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.rule_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = !filterSeverity || alert.severity === filterSeverity;

      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchTerm, filterSeverity]);

  // Contadores de alertas
  const activeCount = statistics?.active || 0;
  const criticalCount = statistics?.by_severity?.CRITICAL || 0;

  // Handler para reconhecer um alerta
  const handleAcknowledge = (alert: Alert) => {
    acknowledgeMutation.mutate({ id: alert.id });
  };

  // Handler para resolver um alerta
  const handleResolve = (alert: Alert) => {
    resolveMutation.mutate({ id: alert.id });
  };

  // Handler para criar OS a partir de um alerta
  const handleCreateWorkOrder = (alert: Alert) => {
    navigate(`/cmms/work-orders/new?alertId=${alert.id}&assetId=${alert.asset_tag}&title=Alerta: ${encodeURIComponent(alert.message)}`);
  };

  // Estado de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando alertas...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <p className="font-medium">Erro ao carregar alertas</p>
          <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas"
        description="Gerencie os alertas do sistema de monitoramento"
        icon={<Bell className="h-6 w-6" />}
      >
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-sm">
            {criticalCount} crítico{criticalCount !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {activeCount} ativo{activeCount !== 1 ? 's' : ''}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => refetch()} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por mensagem, equipamento ou regra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              {/* Severity Filter */}
              <div className="flex gap-1">
                <Button
                  variant={filterSeverity === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSeverity(null)}
                >
                  Todos
                </Button>
                <Button
                  variant={filterSeverity === 'Critical' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSeverity(filterSeverity === 'Critical' ? null : 'Critical')}
                >
                  Crítico
                </Button>
                <Button
                  variant={filterSeverity === 'High' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSeverity(filterSeverity === 'High' ? null : 'High')}
                >
                  Alto
                </Button>
                <Button
                  variant={filterSeverity === 'Medium' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSeverity(filterSeverity === 'Medium' ? null : 'Medium')}
                >
                  Médio
                </Button>
              </div>

              <span className="text-muted-foreground hidden md:inline">|</span>

              {/* Status Filter */}
              <div className="flex gap-1">
                <Button
                  variant={filterStatus === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(null)}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(filterStatus === 'active' ? null : 'active')}
                >
                  Ativos
                </Button>
                <Button
                  variant={filterStatus === 'acknowledged' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(filterStatus === 'acknowledged' ? null : 'acknowledged')}
                >
                  Reconhecidos
                </Button>
                <Button
                  variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(filterStatus === 'resolved' ? null : 'resolved')}
                >
                  Resolvidos
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Alertas */}
      <Card>
        <CardContent className="pt-6">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum alerta encontrado</p>
              <p className="text-sm mt-1">
                {alerts.length === 0 
                  ? 'Não há alertas registrados no sistema'
                  : 'Não há alertas que correspondam aos filtros aplicados'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ordem de Serviço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert: Alert) => (
                  <TableRow key={alert.id}>
                    {/* Severidade */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.severity === 'Critical' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : alert.severity === 'High' || alert.severity === 'Medium' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity_display}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    {/* Mensagem */}
                    <TableCell>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Thermometer className="h-3 w-3" />
                          {alert.equipment_name || alert.asset_tag}
                        </p>
                        {alert.rule_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Regra: {alert.rule_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Valor */}
                    <TableCell>
                      <span className="text-sm">
                        {alert.parameter_value !== null 
                          ? `${alert.parameter_value}${alert.threshold ? ` (limite: ${alert.threshold})` : ''}`
                          : '-'}
                      </span>
                      {alert.parameter_key && (
                        <p className="text-xs text-muted-foreground">{alert.parameter_key}</p>
                      )}
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge
                          status={alert.resolved ? 'RESOLVED' : alert.is_active ? 'ACTIVE' : 'ACKNOWLEDGED'}
                          type="alert"
                        />
                        {alert.acknowledged && !alert.resolved && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Reconhecido
                          </span>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Data/Hora */}
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(alert.triggered_at)}
                        </p>
                        {alert.resolved_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Resolvido: {formatDateTime(alert.resolved_at)}
                          </p>
                        )}
                        {alert.acknowledged_at && !alert.resolved && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reconhecido: {formatDateTime(alert.acknowledged_at)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Ordem de Serviço */}
                    <TableCell>
                      {alert.work_order_id ? (
                        <Link 
                          to={`/cmms/work-orders/${alert.work_order_id}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <ClipboardList className="h-3 w-3" />
                          {alert.work_order_id}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : !alert.resolved ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => handleCreateWorkOrder(alert)}
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          Criar OS
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    {/* Ações */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" title="Ver detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!alert.acknowledged && !alert.resolved && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Reconhecer"
                            onClick={() => handleAcknowledge(alert)}
                            disabled={acknowledgeMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!alert.resolved && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Resolver"
                            onClick={() => handleResolve(alert)}
                            disabled={resolveMutation.isPending}
                          >
                            <BellOff className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
