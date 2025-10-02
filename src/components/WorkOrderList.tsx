import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Play, Edit, ClipboardList, AlertTriangle, User, FileText } from 'lucide-react';
import { useEquipment, useSectors, useCompanies } from '@/hooks/useDataTemp';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { printWorkOrder } from '@/utils/printWorkOrder';
import type { WorkOrder } from '@/types';
import { cn } from '@/lib/utils';

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  onStartWorkOrder?: (id: string) => void;
  onEditWorkOrder?: (wo: WorkOrder) => void;
  compact?: boolean;
}

export function WorkOrderList({ 
  workOrders, 
  onStartWorkOrder, 
  onEditWorkOrder,
  compact = false
}: WorkOrderListProps) {
  const [equipment] = useEquipment();
  const [sectors] = useSectors();
  const [companies] = useCompanies();
  const { selectedWorkOrderId, setSelectedWorkOrder } = useWorkOrderStore();

  const handlePrintWorkOrder = (workOrder: WorkOrder) => {
    printWorkOrder({
      workOrder,
      equipment,
      sectors,
      companies
    });
  };

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    // Use apenas a store global para evitar dupla atualização
    setSelectedWorkOrder(workOrder);
    // onSelectWorkOrder já seria chamado pelo handleSelectWorkOrder do panel,
    // causando dupla atualização e loop infinito
  };

  const handleKeyDown = (event: React.KeyboardEvent, workOrder: WorkOrder) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWorkOrderClick(workOrder);
    }
  };

  // Compact mode - Gmail-style list view for panel
  if (compact) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
          <h3 className="font-medium text-sm text-muted-foreground">
            Ordens de Serviço ({workOrders.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border/60">
            {workOrders.map((wo) => {
            const eq = equipment.find(e => e.id === wo.equipmentId);

            const isSelected = selectedWorkOrderId === wo.id;
            const isOverdue = wo.scheduledDate && new Date(wo.scheduledDate) < new Date() && wo.status !== 'COMPLETED';
            const isToday = wo.scheduledDate && new Date(wo.scheduledDate).toDateString() === new Date().toDateString();
            
            // Format date Gmail style (show time if today, date if not)
            const formatDate = (dateString: string) => {
              const date = new Date(dateString);
              if (isToday) {
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              } else {
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              }
            };

            // Priority color indicator
            const getPriorityColor = () => {
              if (isSelected) {
                // Use white/light colors when selected for contrast against teal background
                switch (wo.priority) {
                  case 'CRITICAL': return 'bg-red-200 border border-red-300';
                  case 'HIGH': return 'bg-orange-200 border border-orange-300';
                  case 'MEDIUM': return 'bg-yellow-200 border border-yellow-300';
                  case 'LOW': return 'bg-blue-200 border border-blue-300';
                  default: return 'bg-gray-200 border border-gray-300';
                }
              } else {
                switch (wo.priority) {
                  case 'CRITICAL': return 'bg-red-500';
                  case 'HIGH': return 'bg-orange-500';
                  case 'MEDIUM': return 'bg-yellow-500';
                  case 'LOW': return 'bg-blue-500';
                  default: return 'bg-gray-400';
                }
              }
            };
            
            return (
              <div
                key={wo.id}
                role="option"
                tabIndex={0}
                aria-selected={isSelected}
                className={cn(
                  "px-4 py-4 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#006b76]/20 focus:ring-inset relative",
                  isSelected 
                    ? "bg-[#006b76] text-white border-l-4 border-l-white shadow-sm" 
                    : "hover:bg-[#006b76]/10 border-l-4 border-l-transparent",
                  isOverdue && !isSelected && "border-l-red-500/70 bg-red-50/30"
                )}
                onClick={() => handleWorkOrderClick(wo)}
                onKeyDown={(e) => handleKeyDown(e, wo)}
              >
                <div className="flex gap-3">
                  {/* Priority indicator */}
                  <div 
                    className={cn("mt-1.5 h-2 w-2 rounded-full flex-shrink-0", getPriorityColor())}
                    title={`Prioridade: ${wo.priority}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "font-medium text-sm truncate",
                          isSelected ? "text-white" : "text-foreground"
                        )}>
                          {wo.number}
                        </span>
                        {isOverdue && (
                          <AlertTriangle className={cn(
                            "h-3 w-3 flex-shrink-0",
                            isSelected ? "text-red-200" : "text-red-500"
                          )} />
                        )}
                        {wo.status === 'IN_PROGRESS' && (
                          <div className={cn(
                            "h-2 w-2 rounded-full animate-pulse flex-shrink-0",
                            isSelected ? "bg-blue-200" : "bg-blue-500"
                          )} />
                        )}
                      </div>
                      <div className={cn(
                        "text-xs flex-shrink-0",
                        isSelected ? "text-white/90" : "text-muted-foreground"
                      )}>
                        {wo.scheduledDate ? formatDate(wo.scheduledDate) : ''}
                      </div>
                    </div>

                    {/* Equipment line */}
                    <div className={cn(
                      "text-xs truncate mb-1",
                      isSelected ? "text-white/90" : "text-muted-foreground"
                    )}>
                      {eq?.tag || 'Sem equipamento'} {eq && `• ${eq.brand} ${eq.model}`}
                    </div>

                    {/* Description preview - 2 lines with ellipsis */}
                    <div 
                      className={cn(
                        "text-xs mb-3 line-clamp-2 leading-relaxed",
                        isSelected ? "text-white/80" : "text-muted-foreground/80"
                      )}
                      title={wo.description}
                    >
                      {wo.description}
                    </div>

                    {/* Status and metadata row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge 
                          status={wo.status} 
                          className={cn(
                            "text-[10px] px-1.5 py-0.5",
                            isSelected && "bg-white/20 text-white border-white/30"
                          )} 
                        />
                        {wo.type && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] px-1.5 py-0.5",
                              isSelected 
                                ? "border-white/30 text-white bg-white/10" 
                                : wo.type === 'PREVENTIVE' 
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0" 
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0"
                            )}
                          >
                            {wo.type === 'PREVENTIVE' ? 'Prev' : 'Corr'}
                          </Badge>
                        )}
                      </div>
                      
                      {wo.assignedTo && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs",
                          isSelected ? "text-white/90" : "text-muted-foreground"
                        )}>
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-20" title={wo.assignedTo}>
                            {wo.assignedTo.split(' ')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {workOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">Nenhuma ordem de serviço</p>
              <p className="text-xs">Refine os filtros ou crie uma nova OS</p>
            </div>
          )}
          </div>
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handlePrintWorkOrder(wo)}
                    aria-label={`Imprimir ordem de serviço ${wo.number}`}
                    title="Imprimir OS"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
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