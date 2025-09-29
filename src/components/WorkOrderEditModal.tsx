import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Checkbox } from '@/components/ui/checkbox';
import { 
  ClipboardList, 
  CalendarClock, 
  Wrench, 
  Building, 
  Package, 
  AlertTriangle, 
  Plus, 
  Trash2,
  Save,
  X,
  Calendar,
  User,
  Tag,
  MapPin,
  Circle,

  Camera,
  Upload,
  FileText,
  ClipboardCheck
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useCompanies, useSectors, useEquipment, useStockItems } from '@/hooks/useDataTemp';
import type { WorkOrder, WorkOrderStockItem, ChecklistResponse, UploadedPhoto } from '@/types';
import { cn } from '@/lib/utils';

interface WorkOrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  onSave: (updatedWorkOrder: WorkOrder) => void;
}

interface StockItemRequest {
  id: string;
  stockItemId: string;
  name: string;
  quantity: number;
  unit: string;
}



export function WorkOrderEditModal({
  isOpen,
  onClose,
  workOrder,
  onSave
}: WorkOrderEditModalProps) {
  // Estados e hooks
  const [formData, setFormData] = useState<Partial<WorkOrder>>({});
  const [activeTab, setActiveTab] = useState("details");
  const [selectedStockItems, setSelectedStockItems] = useState<StockItemRequest[]>([]);
  const [stockItemForm, setStockItemForm] = useState({ stockItemId: '', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [checklistResponses, setChecklistResponses] = useState<ChecklistResponse[]>([]);
  const [executionDescription, setExecutionDescription] = useState('');
  
  const [equipment] = useEquipment();
  const [sectors] = useSectors();
  const [companies] = useCompanies();
  const [stockItems] = useStockItems();
  
  // Simulação do hook de autenticação - substituir pela implementação real
  const user = { name: 'Usuário Atual', role: 'ADMIN' }; // Placeholder
  const canEditDetails = user.role === 'ADMIN';
  const canEditExecution = true; // Tanto admin quanto técnico podem editar execução
  
  // Carregar dados da ordem de serviço quando abrir o modal
  useEffect(() => {
    if (workOrder && isOpen) {
      setFormData({ ...workOrder });
      
      // Converter WorkOrderStockItem[] para StockItemRequest[]
      const stockItemRequests: StockItemRequest[] = (workOrder.stockItems || []).map(item => ({
        id: item.id,
        stockItemId: item.stockItemId,
        name: item.stockItem?.description || `Item ${item.stockItemId}`,
        quantity: item.quantity,
        unit: item.stockItem?.unit || 'un'
      }));
      
      setSelectedStockItems(stockItemRequests);
      setUploadedPhotos(workOrder.photos || []);
      
      // Se for ordem preventiva sem checklist, criar um exemplo
      const defaultChecklist: ChecklistResponse[] = workOrder.type === 'PREVENTIVE' && (!workOrder.checklistResponses || workOrder.checklistResponses.length === 0) ? [
        {
          taskId: 'task-1',
          taskName: 'Inspeção Visual do Equipamento',
          completed: false,
          observations: '',
          checkItems: [
            { id: 'check-1', description: 'Verificar ruídos anormais', checked: false },
            { id: 'check-2', description: 'Verificar vazamentos', checked: false },
            { id: 'check-3', description: 'Verificar condição das mangueiras', checked: false }
          ]
        },
        {
          taskId: 'task-2',
          taskName: 'Limpeza e Manutenção',
          completed: false,
          observations: '',
          checkItems: [
            { id: 'check-4', description: 'Limpar filtros', checked: false },
            { id: 'check-5', description: 'Verificar pressão do sistema', checked: false },
            { id: 'check-6', description: 'Lubrificar componentes', checked: false }
          ]
        }
      ] : (workOrder.checklistResponses || []);
      
      setChecklistResponses(defaultChecklist);
      setExecutionDescription(workOrder.executionDescription || '');
      setActiveTab("details");
      setErrors({});
    }
  }, [workOrder, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({});
      setSelectedStockItems([]);
      setStockItemForm({ stockItemId: '', quantity: 1 });
      setActiveTab("details");
      setErrors({});
    }
  }, [isOpen]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type) newErrors.type = 'Tipo de ordem é obrigatório';
    if (!formData.priority) newErrors.priority = 'Prioridade é obrigatória';
    if (!formData.description) newErrors.description = 'Descrição é obrigatória';
    if (!formData.equipmentId) newErrors.equipmentId = 'Equipamento é obrigatório';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Data programada é obrigatória';
    if (!formData.status) newErrors.status = 'Status é obrigatório';
    
    // Validações específicas para status concluído
    if (formData.status === 'COMPLETED' && !formData.completedAt) {
      newErrors.completedAt = 'Data de conclusão é obrigatória para ordens concluídas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Referência para input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipuladores de eventos
  // Upload de fotos
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: UploadedPhoto = {
            id: `photo-${Date.now()}-${Math.random()}`,
            url: e.target?.result as string,
            name: file.name,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user?.name || 'Usuário'
          };
          setUploadedPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Limpar input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Remover foto
  const removePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleSave = () => {
    if (!formData || !workOrder) return;
    
    if (!validateForm()) {
      setActiveTab("details");
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      try {
        // Converter StockItemRequest[] de volta para WorkOrderStockItem[]
        const updatedStockItems: WorkOrderStockItem[] = selectedStockItems.map(item => ({
          id: item.id,
          workOrderId: workOrder.id,
          stockItemId: item.stockItemId,
          quantity: item.quantity,
          stockItem: stockItems.find(si => si.id === item.stockItemId)
        }));

        // Combina os dados do formulário com os itens de estoque selecionados
        const updatedWorkOrder: WorkOrder = {
          ...workOrder,
          ...formData,
          stockItems: updatedStockItems,
          executionDescription,
          photos: uploadedPhotos,
          checklistResponses,
        };
        
        onSave(updatedWorkOrder);
        onClose();
      } catch (error) {
        console.error('Erro ao salvar ordem de serviço:', error);
      } finally {
        setIsSubmitting(false);
      }
    }, 500); // Simula delay de API
  };
  
  const addStockItem = () => {
    if (!stockItemForm.stockItemId) return;
    
    const stockItem = stockItems.find(si => si.id === stockItemForm.stockItemId);
    
    if (stockItem) {
      const newStockItemRequest: StockItemRequest = {
        id: `${stockItem.id}-${Date.now()}`,
        stockItemId: stockItem.id,
        name: stockItem.description,
        quantity: stockItemForm.quantity,
        unit: stockItem.unit
      };
      
      setSelectedStockItems(prev => [...prev, newStockItemRequest]);
      setStockItemForm({ stockItemId: '', quantity: 1 });
    }
  };

  const removeStockItem = (id: string) => {
    setSelectedStockItems(prev => prev.filter(item => item.id !== id));
  };

  const availableStockItems = stockItems.filter(
    si => !selectedStockItems.some(selected => selected.stockItemId === si.id)
  );

  if (!workOrder) return null;

  // Encontrar o equipamento selecionado para mostrar informações relacionadas
  const selectedEquipment = equipment.find(eq => eq.id === formData.equipmentId);
  const selectedSector = selectedEquipment 
    ? sectors.find(s => s.id === selectedEquipment.sectorId) 
    : null;
  const selectedCompany = selectedSector 
    ? companies.find(c => c.id === selectedSector.companyId) 
    : null;

  // Helper para obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-blue-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Helper para obter label da prioridade
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Baixa';
      case 'MEDIUM': return 'Média';
      case 'HIGH': return 'Alta';
      case 'CRITICAL': return 'Crítica';
      default: return priority;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header - Fixed */}
        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Editar Ordem de Serviço
                </DialogTitle>
                <div className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                  formData.status === 'OPEN' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                  formData.status === 'IN_PROGRESS' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                  formData.status === 'COMPLETED' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    formData.status === 'OPEN' && "bg-blue-500",
                    formData.status === 'IN_PROGRESS' && "bg-yellow-500",
                    formData.status === 'COMPLETED' && "bg-green-500"
                  )} />
                  {formData.status === 'OPEN' && 'Aberta'}
                  {formData.status === 'IN_PROGRESS' && 'Em Andamento'}
                  {formData.status === 'COMPLETED' && 'Concluída'}
                </div>
              </div>
              <DialogDescription>
                OS #{workOrder.number} - Atualize as informações necessárias
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-full justify-start px-6 py-0 h-12 bg-muted/50 rounded-none border-b shrink-0">
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Detalhes</span>
                {Object.keys(errors).length > 0 && (
                  <span className="h-5 w-5 bg-destructive rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="materials" 
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <Package className="h-4 w-4" />
                <span>Materiais</span>
                {selectedStockItems.length > 0 && (
                  <span className="h-5 w-5 bg-secondary rounded-full flex items-center justify-center text-xs font-medium">
                    {selectedStockItems.length}
                  </span>
                )}
              </TabsTrigger>
              {workOrder.status !== 'COMPLETED' && (
                <TabsTrigger 
                  value="execution" 
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Execução</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <ScrollArea className="flex-1">
              <div className="p-6">
                {/* Aba de Detalhes */}
                {canEditDetails && (
                  <TabsContent value="details" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Coluna Esquerda */}
                      <div className="space-y-6">
                        {/* Informações Básicas */}
                        <div className="rounded-lg border bg-card">
                          <div className="px-4 py-3 border-b bg-muted/50">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-muted-foreground" />
                              Informações Básicas
                            </h3>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* Tipo de Ordem */}
                            <div className="space-y-2">
                              <Label htmlFor="workOrderType">
                                Tipo de Ordem <span className="text-destructive">*</span>
                              </Label>
                              <Select 
                                value={formData.type || ''} 
                                onValueChange={(value) => {
                                  setFormData(prev => ({ ...prev, type: value as WorkOrder['type'] }));
                                  if (errors.type) setErrors(prev => ({ ...prev, type: '' }));
                                }}
                              >
                                <SelectTrigger className={cn(errors.type && "border-destructive")}>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CORRECTIVE">
                                    <div className="flex items-center gap-2">
                                      <Wrench className="h-4 w-4" />
                                      Corretiva
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="PREVENTIVE">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Preventiva
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.type && (
                                <p className="text-xs text-destructive">{errors.type}</p>
                              )}
                            </div>
                            
                            {/* Prioridade */}
                            <div className="space-y-2">
                              <Label htmlFor="workOrderPriority">
                                Prioridade <span className="text-destructive">*</span>
                              </Label>
                              <Select 
                                value={formData.priority || ''} 
                                onValueChange={(value) => {
                                  setFormData(prev => ({ ...prev, priority: value as WorkOrder['priority'] }));
                                  if (errors.priority) setErrors(prev => ({ ...prev, priority: '' }));
                                }}
                              >
                                <SelectTrigger className={cn(errors.priority && "border-destructive")}>
                                  <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                      <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", getPriorityColor(priority))} />
                                        <span>{getPriorityLabel(priority)}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.priority && (
                                <p className="text-xs text-destructive">{errors.priority}</p>
                              )}
                            </div>
                            
                            {/* Descrição */}
                            <div className="space-y-2">
                              <Label htmlFor="workOrderDescription">
                                Descrição <span className="text-destructive">*</span>
                              </Label>
                              <Textarea 
                                id="workOrderDescription"
                                value={formData.description || ''} 
                                onChange={(e) => {
                                  setFormData(prev => ({ ...prev, description: e.target.value }));
                                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                                }}
                                placeholder="Descreva o problema ou trabalho a ser realizado"
                                rows={4}
                                className={cn(
                                  "resize-none",
                                  errors.description && "border-destructive"
                                )}
                              />
                              {errors.description && (
                                <p className="text-xs text-destructive">{errors.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Agendamento */}
                        <div className="rounded-lg border bg-card">
                          <div className="px-4 py-3 border-b bg-muted/50">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-muted-foreground" />
                              Agendamento
                            </h3>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* Data Programada */}
                            <div className="space-y-2">
                              <Label htmlFor="scheduledDate">
                                Data Programada <span className="text-destructive">*</span>
                              </Label>
                              <DatePicker
                                date={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}
                                setDate={(date) => {
                                  setFormData(prev => ({ ...prev, scheduledDate: date?.toISOString() }));
                                  if (errors.scheduledDate) setErrors(prev => ({ ...prev, scheduledDate: '' }));
                                }}
                                className={cn(errors.scheduledDate && "border-destructive")}
                              />
                              {errors.scheduledDate && (
                                <p className="text-xs text-destructive">{errors.scheduledDate}</p>
                              )}
                            </div>
                            
                            {/* Responsável */}
                            <div className="space-y-2">
                              <Label htmlFor="assignedTo">
                                <User className="h-3.5 w-3.5 inline mr-1.5" />
                                Responsável
                              </Label>
                              <Input 
                                id="assignedTo"
                                value={formData.assignedTo || ''} 
                                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                                placeholder="Nome do técnico responsável"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Coluna Direita */}
                      <div className="space-y-6">
                        {/* Localização e Equipamento */}
                        <div className="rounded-lg border bg-card">
                          <div className="px-4 py-3 border-b bg-muted/50">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              Localização e Equipamento
                            </h3>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* Equipamento */}
                            <div className="space-y-2">
                              <Label htmlFor="equipmentId">
                                <Tag className="h-3.5 w-3.5 inline mr-1.5" />
                                Equipamento <span className="text-destructive">*</span>
                              </Label>
                              <Select 
                                value={formData.equipmentId || ''} 
                                onValueChange={(value) => {
                                  setFormData(prev => ({ ...prev, equipmentId: value }));
                                  if (errors.equipmentId) setErrors(prev => ({ ...prev, equipmentId: '' }));
                                }}
                              >
                                <SelectTrigger className={cn(errors.equipmentId && "border-destructive")}>
                                  <SelectValue placeholder="Selecione o equipamento" />
                                </SelectTrigger>
                                <SelectContent>
                                  {equipment.map(eq => (
                                    <SelectItem key={eq.id} value={eq.id}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{eq.tag}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {eq.brand} {eq.model}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.equipmentId && (
                                <p className="text-xs text-destructive">{errors.equipmentId}</p>
                              )}
                            </div>
                            
                            {/* Informações do equipamento selecionado */}
                            {selectedEquipment && (
                              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Tipo:</span>
                                    <p className="font-medium">{selectedEquipment.type}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Marca:</span>
                                    <p className="font-medium">{selectedEquipment.brand}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Modelo:</span>
                                    <p className="font-medium">{selectedEquipment.model}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Capacidade:</span>
                                    <p className="font-medium">{selectedEquipment.capacity.toLocaleString()} BTUs</p>
                                  </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Localização:</span>
                                  </div>
                                  <div className="pl-5 space-y-1">
                                    <p><span className="text-muted-foreground">Empresa:</span> <span className="font-medium">{selectedCompany?.name || 'Não definida'}</span></p>
                                    <p><span className="text-muted-foreground">Setor:</span> <span className="font-medium">{selectedSector?.name || 'Não definido'}</span></p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Status da Ordem de Serviço */}
                        <div className="rounded-lg border bg-card">
                          <div className="px-4 py-3 border-b bg-muted/50">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                              <Circle className="h-4 w-4 text-muted-foreground" />
                              Status da Ordem
                            </h3>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="workOrderStatus">Status Atual</Label>
                              <Select 
                                value={formData.status || ''} 
                                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as WorkOrder['status'] }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="OPEN">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                      Aberta
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="IN_PROGRESS">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                                      Em Progresso
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="COMPLETED">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500" />
                                      Concluída
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Aba de Materiais */}
                <TabsContent value="materials" className="mt-0 space-y-6">
                  <div className="rounded-lg border bg-card">
                    <div className="px-4 py-3 border-b bg-muted/50">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        Itens de Estoque Utilizados
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Adicionar item */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <Label htmlFor="stockItemId" className="sr-only">Item</Label>
                          <Select 
                            value={stockItemForm.stockItemId} 
                            onValueChange={(value) => setStockItemForm(prev => ({ ...prev, stockItemId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um item do estoque" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStockItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  <div className="flex justify-between items-center w-full">
                                    <span>{item.description}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {item.unit}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="w-full sm:w-28">
                          <Label htmlFor="quantity" className="sr-only">Quantidade</Label>
                          <Input 
                            id="quantity"
                            type="number" 
                            min="1"
                            value={stockItemForm.quantity} 
                            onChange={(e) => setStockItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            placeholder="Qtd"
                          />
                        </div>
                        
                        <Button 
                          onClick={addStockItem}
                          disabled={!stockItemForm.stockItemId}
                          className="sm:w-auto"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                      
                      {/* Lista de itens adicionados */}
                      {selectedStockItems.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">
                          <div className="flex flex-col items-center text-center">
                            <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                              Nenhum item adicionado
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Selecione itens do estoque que serão utilizados
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                                  Item
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                                  Quantidade
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-16">
                                  Ação
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedStockItems.map((item, index) => (
                                <tr key={item.id} className={cn(
                                  "border-b",
                                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                                )}>
                                  <td className="px-4 py-3">
                                    <p className="font-medium text-sm">{item.name}</p>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                      {item.quantity} {item.unit}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => removeStockItem(item.id)}
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Aba de Execução */}
                {canEditExecution && (
                  <TabsContent value="execution" className="mt-0 space-y-6">
                    {/* Status de Execução */}
                    <div className="rounded-lg border bg-card">
                      <div className="px-4 py-3 border-b bg-muted/50">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Circle className="h-4 w-4 text-muted-foreground" />
                          Status da Ordem
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as WorkOrder['status'] }))}
                          >
                            <SelectTrigger className={cn(errors.status && "border-destructive")}>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OPEN">Aberta</SelectItem>
                              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                              <SelectItem value="COMPLETED">Concluída</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Descrição da Execução */}
                    <div className="rounded-lg border bg-card">
                      <div className="px-4 py-3 border-b bg-muted/50">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Descrição da Execução
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          <Label htmlFor="executionDescription">Detalhes da Execução</Label>
                          <Textarea
                            id="executionDescription"
                            value={executionDescription}
                            onChange={(e) => setExecutionDescription(e.target.value)}
                            placeholder="Descreva os procedimentos realizados, observações e resultados..."
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Checklist para Ordens Preventivas */}
                    {formData.type === 'PREVENTIVE' && (
                      <div className="rounded-lg border bg-card">
                        <div className="px-4 py-3 border-b bg-muted/50">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                            Checklist de Manutenção
                          </h3>
                        </div>
                        <div className="p-4">
                          {checklistResponses.length > 0 ? (
                            <div className="space-y-4">
                              {checklistResponses.map((response, index) => (
                                <div key={response.taskId} className="p-3 border rounded-lg space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">{response.taskName}</h4>
                                    <Checkbox
                                      checked={response.completed}
                                      onCheckedChange={(checked) => {
                                        const updated = [...checklistResponses];
                                        updated[index] = { ...response, completed: checked === true };
                                        setChecklistResponses(updated);
                                      }}
                                    />
                                  </div>
                                  
                                  {response.checkItems && response.checkItems.length > 0 && (
                                    <div className="ml-4 space-y-2">
                                      {response.checkItems.map((item, itemIndex) => (
                                        <div key={item.id} className="flex items-center gap-2 text-sm">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={(checked) => {
                                              const updated = [...checklistResponses];
                                              updated[index].checkItems![itemIndex] = { 
                                                ...item, 
                                                checked: checked === true 
                                              };
                                              setChecklistResponses(updated);
                                            }}
                                          />
                                          <span className="text-muted-foreground">{item.description}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="space-y-2">
                                    <Label className="text-xs">Observações</Label>
                                    <Textarea
                                      value={response.observations || ''}
                                      onChange={(e) => {
                                        const updated = [...checklistResponses];
                                        updated[index] = { ...response, observations: e.target.value };
                                        setChecklistResponses(updated);
                                      }}
                                      placeholder="Observações adicionais sobre esta tarefa..."
                                      rows={2}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Nenhum checklist disponível para esta ordem preventiva</p>
                              <p className="text-xs mt-1">O checklist será carregado automaticamente do plano de manutenção</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Upload de Fotos */}
                    <div className="rounded-lg border bg-card">
                      <div className="px-4 py-3 border-b bg-muted/50">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          Fotos da Execução
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                          <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Arraste fotos aqui ou clique para selecionar
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Adicionar Fotos
                          </Button>
                        </div>

                        {/* Photos Grid */}
                        {uploadedPhotos.length > 0 && (
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {uploadedPhotos.map((photo) => (
                              <div key={photo.id} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                                  <img
                                    src={photo.url}
                                    alt={photo.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removePhoto(photo.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs truncate">
                                  {photo.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Data de Conclusão */}
                    {formData.status === 'COMPLETED' && (
                      <div className="rounded-lg border bg-card">
                        <div className="px-4 py-3 border-b bg-muted/50">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                            Data de Conclusão
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            <Label htmlFor="completedAt">Data de Conclusão *</Label>
                            <DatePicker
                              date={formData.completedAt ? new Date(formData.completedAt) : undefined}
                              setDate={(date) => setFormData(prev => ({ ...prev, completedAt: date?.toISOString() }))}
                              placeholder="Selecione quando foi concluída"
                            />
                            {errors.completedAt && <p className="text-sm text-destructive">{errors.completedAt}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t bg-background px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {Object.keys(errors).length > 0 && (
                <p className="text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Corrija os campos obrigatórios
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}