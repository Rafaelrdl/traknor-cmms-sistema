import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { InventoryItem, InventoryCategory } from '@/models/inventory';
import { updateItem } from '@/data/inventoryStore';

interface EditItemModalProps {
  item: InventoryItem | null;
  categories: InventoryCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdated: (item: InventoryItem) => void;
}

export function EditItemModal({ item, categories, open, onOpenChange, onItemUpdated }: EditItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: 'uncategorized',
    unit: 'un',
    photo_url: '',
    location_name: '',
    reorder_point: 0,
    min_qty: undefined as number | undefined,
    max_qty: undefined as number | undefined,
    unit_cost: undefined as number | undefined,
    active: true
  });

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        sku: item.sku || '',
        category_id: item.category_id || 'uncategorized',
        unit: item.unit || 'un',
        photo_url: item.photo_url || '',
        location_name: item.location_name || '',
        reorder_point: item.reorder_point,
        min_qty: item.min_qty,
        max_qty: item.max_qty,
        unit_cost: item.unit_cost,
        active: item.active
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formData.name.length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres');
      return;
    }

    if (formData.reorder_point < 0) {
      toast.error('Ponto de reposição deve ser maior ou igual a 0');
      return;
    }

    if (formData.min_qty !== undefined && formData.max_qty !== undefined && formData.min_qty > formData.max_qty) {
      toast.error('Quantidade mínima não pode ser maior que a máxima');
      return;
    }

    setLoading(true);
    
    try {
      const updatedItem = updateItem({
        ...item,
        name: formData.name.trim(),
        sku: formData.sku.trim() || undefined,
        category_id: formData.category_id === 'uncategorized' ? undefined : formData.category_id,
        unit: formData.unit,
        photo_url: formData.photo_url.trim() || undefined,
        location_name: formData.location_name.trim() || undefined,
        reorder_point: formData.reorder_point,
        min_qty: formData.min_qty,
        max_qty: formData.max_qty,
        unit_cost: formData.unit_cost,
        active: formData.active
      });

      onItemUpdated(updatedItem);
      toast.success('Item atualizado com sucesso');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar item');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Item de Estoque</DialogTitle>
          <DialogDescription>
            Edite as informações do item. Para alterar a quantidade em estoque, use a função "Movimentar".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Filtro de Ar G4 - 610x610x48mm"
                required
                minLength={3}
              />
            </div>

            {/* SKU */}
            <div>
              <Label htmlFor="edit-sku">SKU</Label>
              <Input
                id="edit-sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Ex: FLT-G4-610"
              />
            </div>

            {/* Categoria */}
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unidade */}
            <div>
              <Label htmlFor="edit-unit">Unidade</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade</SelectItem>
                  <SelectItem value="m">Metro</SelectItem>
                  <SelectItem value="kg">Quilograma</SelectItem>
                  <SelectItem value="L">Litro</SelectItem>
                  <SelectItem value="cx">Caixa</SelectItem>
                  <SelectItem value="pç">Peça</SelectItem>
                  <SelectItem value="rolo">Rolo</SelectItem>
                  <SelectItem value="par">Par</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Local */}
            <div>
              <Label htmlFor="edit-location">Local</Label>
              <Input
                id="edit-location"
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                placeholder="Ex: Prateleira A-1"
              />
            </div>

            {/* Estoque Atual (readonly) */}
            <div>
              <Label>Estoque Atual</Label>
              <div className="flex items-center gap-2 h-10 px-3 bg-muted rounded-md">
                <span className="font-medium">{item.qty_on_hand}</span>
                <span className="text-muted-foreground">{item.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use "Movimentar" para alterar quantidade
              </p>
            </div>

            {/* Ponto de Reposição */}
            <div>
              <Label htmlFor="edit-reorder-point">Ponto de Reposição *</Label>
              <Input
                id="edit-reorder-point"
                type="number"
                min="0"
                value={formData.reorder_point}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            {/* Quantidade Mínima */}
            <div>
              <Label htmlFor="edit-min-qty">Quantidade Mínima</Label>
              <Input
                id="edit-min-qty"
                type="number"
                min="0"
                value={formData.min_qty || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, min_qty: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Opcional"
              />
            </div>

            {/* Quantidade Máxima */}
            <div>
              <Label htmlFor="edit-max-qty">Quantidade Máxima</Label>
              <Input
                id="edit-max-qty"
                type="number"
                min="0"
                value={formData.max_qty || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, max_qty: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Opcional"
              />
            </div>

            {/* Custo Unitário */}
            <div>
              <Label htmlFor="edit-unit-cost">Custo Unitário (R$)</Label>
              <Input
                id="edit-unit-cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="0,00"
              />
            </div>

            {/* URL da Foto */}
            <div className="md:col-span-2">
              <Label htmlFor="edit-photo-url">URL da Foto</Label>
              <Input
                id="edit-photo-url"
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Ativo */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked as boolean }))}
            />
            <Label htmlFor="edit-active">Item ativo</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}