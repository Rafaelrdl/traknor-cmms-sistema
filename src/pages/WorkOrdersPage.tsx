import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, ClipboardList, Play, CheckCircle, Camera } from 'lucide-react';
import { ViewToggle } from '@/components/ViewToggle';
import { WorkOrderList } from '@/components/WorkOrderList';
import { WorkOrderKanban } from '@/components/WorkOrderKanban';
import { WorkOrderPanel } from '@/components/WorkOrderPanel';
import { WorkOrderEditModal } from '@/components/WorkOrderEditModal';
import { WorkOrderModal } from '@/components/WorkOrderModal';
import { useWorkOrders, useEquipment, useSectors, useCompanies } from '@/hooks/useDataTemp';
import { useWorkOrderView } from '@/hooks/useWorkOrderView';
import type { WorkOrder, ChecklistItem } from '@/types';

const mockChecklist: ChecklistItem[] = [
  {
    id: '1',
    question: 'Verificar limpeza dos filtros',
    type: 'BOOLEAN',
    required: true
  },
  {
    id: '2', 
    question: 'Medir pressão do sistema (PSI)',
    type: 'NUMBER',
    required: true
  },
  {
    id: '3',
    question: 'Estado geral do equipamento',
    type: 'MULTIPLE_CHOICE',
    options: ['Excelente', 'Bom', 'Regular', 'Ruim'],
    required: true
  },
  {
    id: '4',
    question: 'Observações adicionais',
    type: 'TEXT',
    required: false
  }
];

export function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useWorkOrders();
  const [equipment] = useEquipment();
  const [sectors] = useSectors();
  const [companies] = useCompanies();
  const [view, setView] = useWorkOrderView();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(mockChecklist);

  // Filter work orders
  const filteredOrders = (workOrders || []).filter(wo => {
    const matchesSearch = wo.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const startWorkOrder = (id: string) => {
    setWorkOrders((current) =>
      current?.map(wo => 
        wo.id === id ? { ...wo, status: 'IN_PROGRESS' as const } : wo
      ) || []
    );
  };

  const completeWorkOrder = (id: string) => {
    setWorkOrders((current) =>
      current?.map(wo => 
        wo.id === id ? { 
          ...wo, 
          status: 'COMPLETED' as const,
          completedAt: new Date().toISOString()
        } : wo
      ) || []
    );
    setSelectedOrder(null);
  };

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((current) =>
      current?.map(wo => 
        wo.id === id ? { ...wo, ...updates } : wo
      ) || []
    );
  };

  const handleSaveWorkOrder = (workOrder: WorkOrder) => {
    setWorkOrders((current) =>
      current?.map(wo => 
        wo.id === workOrder.id ? workOrder : wo
      ) || []
    );
  };

  const handleCreateWorkOrder = (newWorkOrderData: Omit<WorkOrder, 'id' | 'number'>) => {
    const newWorkOrder: WorkOrder = {
      ...newWorkOrderData,
      id: `wo-${Date.now()}`,
      number: `OS-${String(Date.now()).slice(-6)}`
    };

    setWorkOrders((current) => [newWorkOrder, ...(current || [])]);
  };

  const handleExecuteWorkOrder = (wo: WorkOrder) => {
    setSelectedOrder(wo);
  };

  const updateChecklistResponse = (questionId: string, response: any) => {
    setChecklist(current =>
      current.map(item =>
        item.id === questionId ? { ...item, response } : item
      )
    );
  };

  const updateChecklistObservations = (questionId: string, observations: string) => {
    setChecklist(current =>
      current.map(item =>
        item.id === questionId ? { ...item, observations } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Ordens de Serviço">
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowNewOrderModal(true)}
        >
          <Plus className="h-4 w-4" />
          Nova OS
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Ordens de Serviço
            </CardTitle>
            <div className="flex items-center gap-4">
              <ViewToggle view={view} onViewChange={setView} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar OS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos Status</SelectItem>
                  <SelectItem value="OPEN">Abertas</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Execução</SelectItem>
                  <SelectItem value="COMPLETED">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'list' && (
            <WorkOrderList
              workOrders={filteredOrders}
              onStartWorkOrder={startWorkOrder}
              onExecuteWorkOrder={handleExecuteWorkOrder}
              onEditWorkOrder={setEditingOrder}
            />
          )}
          
          {view === 'kanban' && (
            <WorkOrderKanban
              workOrders={filteredOrders}
              onUpdateWorkOrder={updateWorkOrder}
              onStartWorkOrder={startWorkOrder}
              onExecuteWorkOrder={handleExecuteWorkOrder}
              onEditWorkOrder={setEditingOrder}
            />
          )}
          
          {view === 'panel' && (
            <WorkOrderPanel
              workOrders={filteredOrders}
              onStartWorkOrder={startWorkOrder}
              onExecuteWorkOrder={handleExecuteWorkOrder}
              onEditWorkOrder={setEditingOrder}
            />
          )}
        </CardContent>
      </Card>

      {/* Execution Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Executar OS: {selectedOrder.number}</SheetTitle>
                <SheetDescription>
                  Preencha o checklist de manutenção
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Equipment Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Informações do Equipamento</h4>
                  <div className="text-sm space-y-1">
                    {(() => {
                      const eq = equipment.find(e => e.id === selectedOrder.equipmentId);
                      return (
                        <>
                          <div><strong>Tag:</strong> {eq?.tag}</div>
                          <div><strong>Modelo:</strong> {eq?.brand} {eq?.model}</div>
                          <div><strong>Tipo:</strong> {eq?.type}</div>
                          <div><strong>Capacidade:</strong> {eq?.capacity.toLocaleString()} BTUs</div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <Separator />

                {/* Checklist */}
                <div className="space-y-4">
                  <h4 className="font-medium">Checklist de Manutenção</h4>
                  
                  {checklist.map((item, index) => (
                    <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {index + 1}. {item.question}
                            </span>
                            {item.required && (
                              <Badge variant="destructive" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Response Input */}
                      <div className="space-y-2">
                        {item.type === 'BOOLEAN' && (
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={item.id}
                              checked={item.response === true}
                              onCheckedChange={(checked) => 
                                updateChecklistResponse(item.id, checked === true)
                              }
                            />
                            <label htmlFor={item.id} className="text-sm">
                              Conforme
                            </label>
                          </div>
                        )}

                        {item.type === 'NUMBER' && (
                          <Input
                            type="number"
                            placeholder="Digite o valor"
                            value={typeof item.response === 'number' ? item.response.toString() : ''}
                            onChange={(e) => 
                              updateChecklistResponse(item.id, parseFloat(e.target.value))
                            }
                          />
                        )}

                        {item.type === 'TEXT' && (
                          <Textarea
                            placeholder="Digite suas observações"
                            value={typeof item.response === 'string' ? item.response : ''}
                            onChange={(e) => 
                              updateChecklistResponse(item.id, e.target.value)
                            }
                          />
                        )}

                        {item.type === 'MULTIPLE_CHOICE' && (
                          <Select 
                            value={item.response as string || undefined} 
                            onValueChange={(value) => 
                              updateChecklistResponse(item.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                            <SelectContent>
                              {item.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Observations */}
                        <Textarea
                          placeholder="Observações adicionais (opcional)"
                          value={item.observations || ''}
                          onChange={(e) => 
                            updateChecklistObservations(item.id, e.target.value)
                          }
                          className="mt-2"
                        />

                        {/* Photo Upload */}
                        <Button variant="outline" size="sm" className="mt-2">
                          <Camera className="h-4 w-4 mr-2" />
                          Adicionar Foto
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Complete Button */}
                <Button 
                  onClick={() => completeWorkOrder(selectedOrder.id)}
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluir OS
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Work Order Modal */}
      <WorkOrderEditModal
        workOrder={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleSaveWorkOrder}
      />

      {/* New Work Order Modal */}
      <WorkOrderModal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onSave={handleCreateWorkOrder}
      />
    </div>
  );
}