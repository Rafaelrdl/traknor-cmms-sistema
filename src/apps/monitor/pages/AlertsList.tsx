/**
 * AlertsList - Lista de alertas do sistema de monitoramento
 * 
 * Exibe todos os alertas com:
 * - Filtros por severidade e status
 * - Ações de acknowledge e resolução
 * - Detalhes expandíveis
 * - Navegação cruzada para OS no CMMS
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader, StatusBadge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
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
  ExternalLink
} from 'lucide-react';

// Dados mockados para demonstração
const mockAlerts = [
  {
    id: 1,
    severity: 'critical',
    status: 'active',
    message: 'Temperatura acima do limite crítico',
    equipment: 'Condensadora Externa',
    equipmentId: 'asset-002',
    value: '42.5°C (limite: 40°C)',
    timestamp: '2024-01-15 14:32:15',
    acknowledged: false,
    icon: 'temperature',
    workOrderId: null, // Sem OS criada
  },
  {
    id: 2,
    severity: 'critical',
    status: 'active',
    message: 'Consumo energético acima do esperado',
    equipment: 'Chiller Principal',
    equipmentId: 'asset-001',
    value: '156 kW (limite: 140 kW)',
    timestamp: '2024-01-15 14:25:00',
    acknowledged: true,
    icon: 'energy',
    workOrderId: 'WO-002', // OS já criada
  },
  {
    id: 3,
    severity: 'warning',
    status: 'active',
    message: 'Sensor desconectado',
    equipment: 'Fan Coil - Sala 3',
    equipmentId: 'asset-003',
    value: 'Sem comunicação há 45 min',
    timestamp: '2024-01-15 13:47:22',
    acknowledged: false,
    icon: 'connection',
    workOrderId: null,
  },
  {
    id: 4,
    severity: 'warning',
    status: 'resolved',
    message: 'Pressão alta detectada',
    equipment: 'Chiller Principal',
    equipmentId: 'asset-001',
    value: '19.2 bar (limite: 19 bar)',
    timestamp: '2024-01-15 12:15:00',
    resolvedAt: '2024-01-15 12:45:00',
    acknowledged: true,
    icon: 'temperature',
    workOrderId: 'WO-001',
  },
  {
    id: 5,
    severity: 'info',
    status: 'resolved',
    message: 'Manutenção preventiva programada',
    equipment: 'Split - Recepção',
    equipmentId: 'asset-004',
    value: 'Próxima: 20/01/2024',
    timestamp: '2024-01-15 09:00:00',
    resolvedAt: '2024-01-15 09:30:00',
    acknowledged: true,
    icon: 'info',
    workOrderId: null,
  },
];

const getAlertIcon = (iconType: string) => {
  switch (iconType) {
    case 'temperature':
      return <Thermometer className="h-4 w-4" />;
    case 'energy':
      return <Zap className="h-4 w-4" />;
    case 'connection':
      return <Wifi className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'warning':
      return 'secondary';
    case 'info':
      return 'outline';
    default:
      return 'secondary';
  }
};

export function AlertsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesSearch = 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = !filterSeverity || alert.severity === filterSeverity;
    const matchesStatus = !filterStatus || alert.status === filterStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const activeCount = mockAlerts.filter(a => a.status === 'active').length;
  const criticalCount = mockAlerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  // Handler para criar OS a partir de um alerta
  const handleCreateWorkOrder = (alert: typeof mockAlerts[0]) => {
    // Em produção, chamaria o backend para criar a OS e depois redirecionar
    navigate(`/cmms/work-orders/new?alertId=${alert.id}&assetId=${alert.equipmentId}&title=Alerta: ${encodeURIComponent(alert.message)}`);
  };

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
                placeholder="Buscar por mensagem ou equipamento..."
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
                  variant={filterSeverity === 'critical' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSeverity(filterSeverity === 'critical' ? null : 'critical')}
                >
                  Crítico
                </Button>
                <Button
                  variant={filterSeverity === 'warning' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSeverity(filterSeverity === 'warning' ? null : 'warning')}
                >
                  Aviso
                </Button>
              </div>

              <span className="text-muted-foreground hidden md:inline">|</span>

              {/* Status Filter */}
              <div className="flex gap-1">
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(filterStatus === 'active' ? null : 'active')}
                >
                  Ativos
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
              <p className="text-sm mt-1">Não há alertas que correspondam aos filtros aplicados</p>
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
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    {/* Severidade */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.severity === 'critical' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : alert.severity === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge variant={getSeverityColor(alert.severity) as 'destructive' | 'secondary' | 'outline'}>
                          {alert.severity === 'critical' ? 'Crítico' :
                           alert.severity === 'warning' ? 'Aviso' : 'Info'}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    {/* Mensagem */}
                    <TableCell>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          {getAlertIcon(alert.icon)}
                          {alert.equipment}
                        </p>
                      </div>
                    </TableCell>
                    
                    {/* Valor */}
                    <TableCell>
                      <span className="text-sm">{alert.value}</span>
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge
                          status={alert.status === 'active' ? 'ACTIVE' : 'RESOLVED'}
                          type="alert"
                        />
                        {alert.acknowledged && (
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
                          {alert.timestamp}
                        </p>
                        {alert.resolvedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Resolvido: {alert.resolvedAt}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Ordem de Serviço */}
                    <TableCell>
                      {alert.workOrderId ? (
                        <Link 
                          to={`/cmms/work-orders/${alert.workOrderId}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <ClipboardList className="h-3 w-3" />
                          {alert.workOrderId}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : alert.status === 'active' ? (
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
                        {alert.status === 'active' && !alert.acknowledged && (
                          <Button variant="ghost" size="sm" title="Reconhecer">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {alert.status === 'active' && (
                          <Button variant="ghost" size="sm" title="Silenciar">
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
