import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Save, ChevronLeft, ChevronRight, Plus, Minus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useEquipment, useStockItems } from '@/hooks/useDataTemp';
import type { WorkOrder, StockItem } from '@/types';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workOrder: Omit<WorkOrder, 'id' | 'number'>) => void;
}

interface StockItemSelection {
  stockItemId: string;
  quantity: number;
  stockItem: StockItem;
}

type Step = 'basic' | 'materials' | 'preview';

export function WorkOrderModal({ isOpen, onClose, onSave }: WorkOrderModalProps) {
  const [equipment] = useEquipment();
  const [stockItems] = useStockItems();
  
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    equipmentId: '',
    type: 'PREVENTIVE' as WorkOrder['type'],
    priority: 'MEDIUM' as WorkOrder['priority'],
    scheduledDate: '',
    assignedTo: '',
    description: '',
    status: 'OPEN' as WorkOrder['status']
  });

  const [selectedStockItems, setSelectedStockItems] = useState<StockItemSelection[]>([]);

  const resetForm = () => {
    setFormData({
      equipmentId: '',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      scheduledDate: '',
      assignedTo: '',
      description: '',
      status: 'OPEN'
    });
    setSelectedStockItems([]);
    setCurrentStep('basic');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const workOrderData = {
        ...formData,
        stockItems: selectedStockItems.map(item => ({
          id: `temp-${Date.now()}-${item.stockItemId}`,
          workOrderId: '',
          stockItemId: item.stockItemId,
          quantity: item.quantity
        }))
      };

      onSave(workOrderData);
      handleClose();
    } catch (error) {
      console.error('Error saving work order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addStockItem = (stockItemId: string) => {
    const stockItem = stockItems.find(si => si.id === stockItemId);
    if (!stockItem) return;

    const newStockItem: StockItemSelection = {
      stockItemId,
      quantity: 1,
      stockItem
    };

    setSelectedStockItems(prev => [...prev, newStockItem]);
  };

  const updateStockItemQuantity = (stockItemId: string, quantity: number) => {
    setSelectedStockItems(prev => 
      prev.map(item => 
        item.stockItemId === stockItemId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const removeStockItem = (stockItemId: string) => {
    setSelectedStockItems(prev => prev.filter(item => item.stockItemId !== stockItemId));
  };

  const availableStockItems = stockItems.filter(
    si => !selectedStockItems.some(selected => selected.stockItemId === si.id)
  );

  const selectedEquipment = equipment.find(eq => eq.id === formData.equipmentId);

  const isBasicStepValid = () => {
    return formData.equipmentId && formData.description && formData.scheduledDate;
  };

  const canGoNext = () => {
    if (currentStep === 'basic') return isBasicStepValid();
    return true;
  };

  const renderBasicStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="equipmentId">Equipamento *</Label>
          <Select
            value={formData.equipmentId}
            onValueChange={(value) => 
              setFormData(prev => ({ ...prev, equipmentId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um equipamento" />
            </SelectTrigger>
            <SelectContent>
              {equipment.map(eq => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.tag} - {eq.brand} {eq.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: WorkOrder['type']) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PREVENTIVE">Preventiva</SelectItem>
                <SelectItem value="CORRECTIVE">Corretiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: WorkOrder['priority']) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Baixa</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="CRITICAL">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Data Agendada *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.scheduledDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.scheduledDate ? (
                  format(new Date(formData.scheduledDate), "PPP", { locale: ptBR })
                ) : (
                  "Selecione uma data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}
                onSelect={(date) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.toISOString() : '' 
                  }))
                }
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedTo">Responsável</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => 
              setFormData(prev => ({ ...prev, assignedTo: e.target.value }))
            }
            placeholder="Nome do responsável"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => 
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            placeholder="Descrição da ordem de serviço"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderMaterialsStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Materiais Necessários</h4>
          {availableStockItems.length > 0 && (
            <Select onValueChange={addStockItem}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Adicionar material" />
              </SelectTrigger>
              <SelectContent>
                {availableStockItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.code} - {item.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {selectedStockItems.map(item => (
            <div key={item.stockItemId} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm">{item.stockItem.code}</div>
                <div className="text-xs text-muted-foreground">
                  {item.stockItem.description}
                </div>
                <Badge variant="outline" className="text-xs mt-1">
                  Disponível: {item.stockItem.quantity} {item.stockItem.unit}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStockItemQuantity(item.stockItemId, item.quantity - 1)}
                  disabled={item.quantity <= 0}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-12 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStockItemQuantity(item.stockItemId, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStockItem(item.stockItemId)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {selectedStockItems.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
              Nenhum material selecionado
              <p className="text-xs mt-1">
                Você pode adicionar materiais posteriormente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo da Ordem de Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEquipment && (
              <div>
                <h5 className="font-medium text-sm mb-2">Equipamento</h5>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <div><strong>Tag:</strong> {selectedEquipment.tag}</div>
                  <div><strong>Modelo:</strong> {selectedEquipment.brand} {selectedEquipment.model}</div>
                  <div><strong>Tipo:</strong> {selectedEquipment.type}</div>
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Tipo:</span>
                <p className="text-sm text-muted-foreground">
                  {formData.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Prioridade:</span>
                <p className="text-sm text-muted-foreground">
                  {formData.priority === 'LOW' ? 'Baixa' : 
                   formData.priority === 'MEDIUM' ? 'Média' : 
                   formData.priority === 'HIGH' ? 'Alta' : 'Crítica'}
                </p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Data Agendada:</span>
              <p className="text-sm text-muted-foreground">
                {formData.scheduledDate && format(new Date(formData.scheduledDate), "PPP", { locale: ptBR })}
              </p>
            </div>

            {formData.assignedTo && (
              <div>
                <span className="text-sm font-medium">Responsável:</span>
                <p className="text-sm text-muted-foreground">{formData.assignedTo}</p>
              </div>
            )}

            <div>
              <span className="text-sm font-medium">Descrição:</span>
              <p className="text-sm text-muted-foreground">{formData.description}</p>
            </div>

            {selectedStockItems.length > 0 && (
              <>
                <Separator />
                <div>
                  <span className="text-sm font-medium">Materiais ({selectedStockItems.length}):</span>
                  <div className="space-y-2 mt-2">
                    {selectedStockItems.map(item => (
                      <div key={item.stockItemId} className="flex justify-between text-sm">
                        <span>{item.stockItem.code} - {item.stockItem.description}</span>
                        <span className="text-muted-foreground">{item.quantity} {item.stockItem.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'basic': return 'Informações Básicas';
      case 'materials': return 'Materiais';
      case 'preview': return 'Revisão';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'basic': return 'Preencha as informações básicas da ordem de serviço';
      case 'materials': return 'Selecione os materiais necessários (opcional)';
      case 'preview': return 'Revise as informações antes de salvar';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço - {getStepTitle()}</DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 pb-6">
          {(['basic', 'materials', 'preview'] as Step[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === step && "bg-primary text-primary-foreground",
                  (currentStep === 'materials' && step === 'basic') ||
                  (currentStep === 'preview' && (step === 'basic' || step === 'materials'))
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2",
                  (currentStep === 'materials' && step === 'basic') ||
                  (currentStep === 'preview' && step === 'materials')
                    ? "bg-primary"
                    : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        <ScrollArea className="max-h-96">
          {currentStep === 'basic' && renderBasicStep()}
          {currentStep === 'materials' && renderMaterialsStep()}
          {currentStep === 'preview' && renderPreviewStep()}
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 'materials') setCurrentStep('basic');
                  if (currentStep === 'preview') setCurrentStep('materials');
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            
            {currentStep === 'preview' ? (
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Criar OS'}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (currentStep === 'basic') setCurrentStep('materials');
                  if (currentStep === 'materials') setCurrentStep('preview');
                }}
                disabled={!canGoNext()}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}