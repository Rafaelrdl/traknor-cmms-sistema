import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { CalendarIcon, Save, X, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useEquipment, useStockItems } from '@/hooks/useApiData';
import type { WorkOrder, WorkOrderStockItem, StockItem } from '@/types';

interface EditWorkOrderDrawerProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (workOrder: WorkOrder) => void;
}

interface StockItemSelection extends WorkOrderStockItem {
  stockItem: StockItem;
}

export function EditWorkOrderDrawer({ 
  workOrder, 
  isOpen, 
  onClose, 
  onSave 
}: EditWorkOrderDrawerProps) {
  const [equipment] = useEquipment();
  const [stockItems] = useStockItems();
  
  // Form state
  const [formData, setFormData] = useState<Partial<WorkOrder>>({});
  const [selectedStockItems, setSelectedStockItems] = useState<StockItemSelection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workOrder) {
      setFormData({
        ...workOrder,
        scheduledDate: workOrder.scheduledDate
      });
      
      // Initialize stock items if available
      const stockItemsWithDetails = (workOrder.stockItems || []).map(woStockItem => {
        const stockItem = stockItems.find(si => si.id === woStockItem.stockItemId);
        return {
          ...woStockItem,
          stockItem: stockItem || {
            id: woStockItem.stockItemId,
            code: 'N/A',
            description: 'Item não encontrado',
            unit: '',
            quantity: 0,
            minimum: 0,
            maximum: 0
          }
        };
      });
      
      setSelectedStockItems(stockItemsWithDetails);
    } else {
      setFormData({});
      setSelectedStockItems([]);
    }
  }, [workOrder, stockItems]);

  const handleSave = async () => {
    if (!workOrder || !formData.description || !formData.scheduledDate) return;

    setIsLoading(true);
    
    try {
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        ...formData,
        stockItems: selectedStockItems.map(item => ({
          id: item.id,
          workOrderId: workOrder.id,
          stockItemId: item.stockItemId,
          quantity: item.quantity
        }))
      } as WorkOrder;

      onSave(updatedWorkOrder);
      onClose();
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
      id: `temp-${Date.now()}`,
      workOrderId: workOrder?.id || '',
      stockItemId,
      quantity: 1,
      stockItem
    };

    setSelectedStockItems(prev => [...prev, newStockItem]);
  };

  const updateStockItemQuantity = (id: string, quantity: number) => {
    setSelectedStockItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const removeStockItem = (id: string) => {
    setSelectedStockItems(prev => prev.filter(item => item.id !== id));
  };

  const availableStockItems = stockItems.filter(
    si => !selectedStockItems.some(selected => selected.stockItemId === si.id)
  );

  if (!workOrder) return null;

  const selectedEquipment = equipment.find(eq => eq.id === formData.equipmentId);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg" side="right">
        <SheetHeader>
          <SheetTitle>Editar Ordem de Serviço</SheetTitle>
          <SheetDescription>
            Edite as informações da OS {workOrder.number}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-full pb-24">
          <div className="space-y-6 py-6">
            {/* Equipment Information */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Equipamento</h4>
              <div className="text-sm space-y-1">
                <div><strong>Tag:</strong> {selectedEquipment?.tag}</div>
                <div><strong>Modelo:</strong> {selectedEquipment?.brand} {selectedEquipment?.model}</div>
                <div><strong>Tipo:</strong> {selectedEquipment?.type}</div>
                <div><strong>Capacidade:</strong> {selectedEquipment?.capacity.toLocaleString()} BTUs</div>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Informações Básicas</h4>
              
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
                <Label htmlFor="scheduledDate">Data Agendada</Label>
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
                  value={formData.assignedTo || ''}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, assignedTo: e.target.value }))
                  }
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descrição da ordem de serviço"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Stock Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Materiais Necessários</h4>
                {availableStockItems.length > 0 && (
                  <Select onValueChange={addStockItem}>
                    <SelectTrigger className="w-48">
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

              <div className="space-y-3">
                {selectedStockItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
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
                        onClick={() => updateStockItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 0}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStockItemQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStockItem(item.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {selectedStockItems.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4 border-2 border-dashed rounded-lg">
                    Nenhum material selecionado
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !formData.description || !formData.scheduledDate}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}