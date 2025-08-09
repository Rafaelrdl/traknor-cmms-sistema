import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { InventoryItem, MovementType } from '@/models/inventory';
import { moveItem } from '@/data/inventoryStore';

interface MoveItemModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemMoved: (item: InventoryItem) => void;
}

export function MoveItemModal({ item, open, onOpenChange, onItemMoved }: MoveItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'entrada' as MovementType,
    qty: 1,
    date: '',
    note: '',
    reference_type: '',
    reference_id: '',
    unit_cost: undefined as number | undefined
  });

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open && item) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        type: 'entrada',
        qty: 1,
        date: today,
        note: '',
        reference_type: '',
        reference_id: '',
        unit_cost: undefined
      });
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;
    
    if (formData.qty <= 0) {
      toast.error('Quantidade deve ser maior que 0');
      return;
    }

    if (formData.type === 'saida' && item.qty_on_hand < formData.qty) {
      toast.error('Saldo insuficiente');
      return;
    }

    if (!formData.date) {
      toast.error('Data é obrigatória');
      return;
    }

    setLoading(true);
    
    try {
      await moveItem({
        item_id: item.id,
        type: formData.type,
        qty: formData.qty,
        date: new Date(formData.date + 'T00:00:00.000Z').toISOString(),
        note: formData.note.trim() || undefined,
        reference_type: formData.reference_type || undefined,
        reference_id: formData.reference_id.trim() || undefined,
        unit_cost: formData.unit_cost
      });

      toast.success('Movimentação registrada');
      onOpenChange(false);
      // Trigger refresh by passing the updated item (with new qty)
      const newQty = formData.type === 'entrada' 
        ? item.qty_on_hand + formData.qty
        : item.qty_on_hand - formData.qty;
      onItemMoved({ ...item, qty_on_hand: newQty });
    } catch (error: any) {
      console.error('Error moving item:', error);
      toast.error(error.message || 'Erro ao registrar movimentação');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const projectedQty = formData.type === 'entrada' 
    ? item.qty_on_hand + formData.qty
    : item.qty_on_hand - formData.qty;

  const isInsufficientStock = formData.type === 'saida' && item.qty_on_hand < formData.qty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentar Item</DialogTitle>
          <DialogDescription>
            Registre uma entrada ou saída para {item.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Stock Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Estoque atual</div>
            <div className="text-lg font-semibold">
              {item.qty_on_hand} {item.unit}
            </div>
            {projectedQty !== item.qty_on_hand && (
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">Após movimentação: </span>
                <span className={`font-medium ${isInsufficientStock ? 'text-destructive' : 'text-foreground'}`}>
                  {projectedQty} {item.unit}
                </span>
              </div>
            )}
          </div>

          {/* Movement Type */}
          <div>
            <Label htmlFor="move-type">Tipo de Movimentação *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: MovementType) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                    Entrada
                  </div>
                </SelectItem>
                <SelectItem value="saida">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-red-600" />
                    Saída
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="move-qty">Quantidade *</Label>
            <Input
              id="move-qty"
              type="number"
              min="1"
              max={formData.type === 'saida' ? item.qty_on_hand : undefined}
              value={formData.qty}
              onChange={(e) => setFormData(prev => ({ ...prev, qty: parseInt(e.target.value) || 1 }))}
              required
              className={isInsufficientStock ? 'border-destructive' : ''}
            />
            {isInsufficientStock && (
              <p className="text-sm text-destructive mt-1">
                Quantidade não disponível em estoque
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="move-date">Data *</Label>
            <Input
              id="move-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* Unit Cost (only for entries) */}
          {formData.type === 'entrada' && (
            <div>
              <Label htmlFor="move-unit-cost">Custo Unitário (R$)</Label>
              <Input
                id="move-unit-cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="0,00"
              />
            </div>
          )}

          {/* Reference Type */}
          <div>
            <Label htmlFor="move-ref-type">Tipo de Referência</Label>
            <Select 
              value={formData.reference_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, reference_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                <SelectItem value="os">Ordem de Serviço</SelectItem>
                <SelectItem value="solicitation">Solicitação</SelectItem>
                <SelectItem value="adjustment">Ajuste de Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference ID */}
          {formData.reference_type && (
            <div>
              <Label htmlFor="move-ref-id">ID da Referência</Label>
              <Input
                id="move-ref-id"
                value={formData.reference_id}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_id: e.target.value }))}
                placeholder="Ex: OS-2024-001"
              />
            </div>
          )}

          {/* Note */}
          <div>
            <Label htmlFor="move-note">Observação</Label>
            <Textarea
              id="move-note"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Adicione uma observação sobre esta movimentação (opcional)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || isInsufficientStock}
              className={formData.type === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading 
                ? 'Processando...' 
                : `Registrar ${formData.type === 'entrada' ? 'Entrada' : 'Saída'}`
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}