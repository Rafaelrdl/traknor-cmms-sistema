import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Play, Edit, ClipboardList, AlertTriangle, Calendar, User } from 'lucide-react';
import { useEquipment, useSectors } from '@/hooks/useApiData';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import type { WorkOrder } from '@/types';
import { cn } from '@/lib/utils';

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  onStartWorkOrder?: (id: string) => void;
  onExecuteWorkOrder?: (wo: WorkOrder) => void;
  onEditWorkOrder?: (wo: WorkOrder) => void;
  compact?: boolean;
  onSelectWorkOrder?: (workOrder: WorkOrder) => void;
}

export function WorkOrderList({ 
  workOrders, 
  onStartWorkOrder, 
  onExecuteWorkOrder, 
  onEditWorkOrder,
  compact = false,
  onSelectWorkOrder
}: WorkOrderListProps) {
  const [equipment] = useEquipment();
  const [sectors] = useSectors();
  const { selectedWorkOrderId, setSelectedWorkOrder } = useWorkOrderStore();

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    onSelectWorkOrder?.(workOrder);
  };

  const handleKeyDown = (event: React.KeyboardEvent, workOrder: WorkOrder) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWorkOrderClick(workOrder);
    }
  };

  // Compact mode - list view for panel
  if (compact) {
    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="sticky top-0 bg-background border-b p-3">
          <h3 className="font-medium text-sm text-muted-foreground">
            Ordens de Serviço ({workOrders.length})
          </h3>
        </div>
        <div className="divide-y">
          {workOrders.map((wo) => {
            const eq = equipment.find(e => e.id === wo.equipmentId);
            const sector = sectors.find(s => s.id === eq?.sectorId);
            const isSelected = selectedWorkOrderId === wo.id;
            const isOverdue = new Date(wo.scheduledDate) < new Date() && wo.status !== 'COMPLETED';
            
            return (
              <div
                key={wo.id}
                role="option"
                tabIndex={0}
                aria-selected={isSelected}
                className={cn(
                  "p-3 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset border-l-3",
                  isSelected 
                    ? "bg-[#f1f7f9] border-l-[#006b76]" 
                    : "hover:bg-[#f5fafa] border-l-transparent",
                  isOverdue && "border-l-red-500"
                )}
                onClick={() => handleWorkOrderClick(wo)}
                onKeyDown={(e) => handleKeyDown(e, wo)}
              >
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {wo.number}
                      </span>
                      {isOverdue && (
                        <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <StatusBadge status={wo.priority} className="text-xs" />
                  </div>

                  {/* Equipment */}
                  <div className="text-xs text-muted-foreground truncate">
                    {eq?.tag} • {eq?.brand} {eq?.model}
                  </div>

                  {/* Status and Date */}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={wo.status} className="text-xs" />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(wo.scheduledDate).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </div>
                  </div>

                  {/* Assigned To */}
                  {wo.assignedTo && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="truncate">{wo.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {workOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma OS encontrada</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular table mode
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Equipamento</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Prioridade</TableHead>
          <TableHead>Data Agendada</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workOrders.map((wo) => {
          const eq = equipment.find(e => e.id === wo.equipmentId);
          const sector = sectors.find(s => s.id === eq?.sectorId);
          
          return (
            <TableRow key={wo.id}>
              <TableCell className="font-medium">{wo.number}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{eq?.tag}</div>
                  <div className="text-sm text-muted-foreground">{eq?.brand} {eq?.model}</div>
                  <div className="text-sm text-muted-foreground">{sector?.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={wo.type} />
              </TableCell>
              <TableCell>
                <StatusBadge status={wo.priority} />
              </TableCell>
              <TableCell>
                {new Date(wo.scheduledDate).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>{wo.assignedTo || '-'}</TableCell>
              <TableCell>
                <StatusBadge status={wo.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {wo.status === 'OPEN' && onStartWorkOrder && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onStartWorkOrder(wo.id)}
                      aria-label={`Iniciar ordem de serviço ${wo.number}`}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {wo.status === 'IN_PROGRESS' && onExecuteWorkOrder && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onExecuteWorkOrder(wo)}
                      aria-label={`Executar ordem de serviço ${wo.number}`}
                    >
                      <ClipboardList className="h-4 w-4" />
                    </Button>
                  )}
                  {onEditWorkOrder && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditWorkOrder(wo)}
                      aria-label={`Editar ordem de serviço ${wo.number}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {workOrders.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              Nenhuma ordem de serviço encontrada
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}