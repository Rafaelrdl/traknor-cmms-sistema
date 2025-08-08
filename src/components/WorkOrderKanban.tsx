import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Play, Edit, ClipboardList } from 'lucide-react';
import { useEquipment, useSectors } from '@/hooks/useDataTemp';
import type { WorkOrder } from '@/types';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanColumnProps {
  title: string;
  status: WorkOrder['status'];
  workOrders: WorkOrder[];
  onStartWorkOrder?: (id: string) => void;
  onExecuteWorkOrder?: (wo: WorkOrder) => void;
  onEditWorkOrder?: (wo: WorkOrder) => void;
}

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onStartWorkOrder?: (id: string) => void;
  onExecuteWorkOrder?: (wo: WorkOrder) => void;
  onEditWorkOrder?: (wo: WorkOrder) => void;
}

function WorkOrderCard({ 
  workOrder, 
  onStartWorkOrder, 
  onExecuteWorkOrder, 
  onEditWorkOrder 
}: WorkOrderCardProps) {
  const [equipment] = useEquipment();
  const [sectors] = useSectors();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workOrder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const eq = equipment.find(e => e.id === workOrder.equipmentId);
  const sector = sectors.find(s => s.id === eq?.sectorId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <Card className="mb-3 cursor-move hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{workOrder.number}</p>
                <p className="text-xs text-muted-foreground">{workOrder.description}</p>
              </div>
              <StatusBadge status={workOrder.priority} />
            </div>

            {/* Equipment Info */}
            <div className="text-xs text-muted-foreground">
              <div><strong>Tag:</strong> {eq?.tag}</div>
              <div><strong>Setor:</strong> {sector?.name}</div>
            </div>

            {/* Type and Date */}
            <div className="flex items-center justify-between">
              <StatusBadge status={workOrder.type} />
              <span className="text-xs text-muted-foreground">
                {new Date(workOrder.scheduledDate).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Assigned to */}
            {workOrder.assignedTo && (
              <div className="text-xs">
                <strong>Responsável:</strong> {workOrder.assignedTo}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1 pt-2">
              {workOrder.status === 'OPEN' && onStartWorkOrder && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartWorkOrder(workOrder.id);
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Iniciar
                </Button>
              )}
              {workOrder.status === 'IN_PROGRESS' && onExecuteWorkOrder && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExecuteWorkOrder(workOrder);
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  <ClipboardList className="h-3 w-3 mr-1" />
                  Executar
                </Button>
              )}
              {onEditWorkOrder && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditWorkOrder(workOrder);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({ 
  title, 
  status, 
  workOrders, 
  onStartWorkOrder, 
  onExecuteWorkOrder, 
  onEditWorkOrder 
}: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-80">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-sm">
            {title}
            <Badge variant="secondary" className="ml-2">
              {workOrders.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <SortableContext 
            items={workOrders.map(wo => wo.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-96">
              {workOrders.map((wo) => (
                <WorkOrderCard
                  key={wo.id}
                  workOrder={wo}
                  onStartWorkOrder={onStartWorkOrder}
                  onExecuteWorkOrder={onExecuteWorkOrder}
                  onEditWorkOrder={onEditWorkOrder}
                />
              ))}
              {workOrders.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Nenhuma ordem de serviço
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

interface WorkOrderKanbanProps {
  workOrders: WorkOrder[];
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onStartWorkOrder?: (id: string) => void;
  onExecuteWorkOrder?: (wo: WorkOrder) => void;
  onEditWorkOrder?: (wo: WorkOrder) => void;
}

export function WorkOrderKanban({ 
  workOrders, 
  onUpdateWorkOrder,
  onStartWorkOrder, 
  onExecuteWorkOrder, 
  onEditWorkOrder 
}: WorkOrderKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = useMemo(() => [
    {
      id: 'OPEN',
      title: 'Abertas',
      status: 'OPEN' as const,
      workOrders: workOrders.filter(wo => wo.status === 'OPEN'),
    },
    {
      id: 'IN_PROGRESS',
      title: 'Em Progresso',
      status: 'IN_PROGRESS' as const,
      workOrders: workOrders.filter(wo => wo.status === 'IN_PROGRESS'),
    },
    {
      id: 'COMPLETED',
      title: 'Finalizadas',
      status: 'COMPLETED' as const,
      workOrders: workOrders.filter(wo => wo.status === 'COMPLETED'),
    },
  ], [workOrders]);

  const activeWorkOrder = activeId 
    ? workOrders.find(wo => wo.id === activeId) 
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeWorkOrder = workOrders.find(wo => wo.id === active.id);
    if (!activeWorkOrder) {
      setActiveId(null);
      return;
    }

    // Check if we're dropping on a column
    const overId = over.id as string;
    const targetColumn = columns.find(col => col.id === overId);
    
    if (targetColumn && activeWorkOrder.status !== targetColumn.status) {
      onUpdateWorkOrder(activeWorkOrder.id, { 
        status: targetColumn.status,
        ...(targetColumn.status === 'COMPLETED' && { completedAt: new Date().toISOString() })
      });
    }

    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0">
            <KanbanColumn
              title={column.title}
              status={column.status}
              workOrders={column.workOrders}
              onStartWorkOrder={onStartWorkOrder}
              onExecuteWorkOrder={onExecuteWorkOrder}
              onEditWorkOrder={onEditWorkOrder}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeWorkOrder ? (
          <WorkOrderCard
            workOrder={activeWorkOrder}
            onStartWorkOrder={onStartWorkOrder}
            onExecuteWorkOrder={onExecuteWorkOrder}
            onEditWorkOrder={onEditWorkOrder}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}