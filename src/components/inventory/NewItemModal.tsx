import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import type { InventoryItem, InventoryCategory } from '@/models/inventory';
import { createItem } from '@/data/inventoryStore';

interface NewItemModalProps {
  categories: InventoryCategory[];
  onItemCreated: (item: InventoryItem) => void;
  trigger?: React.ReactNode;
}

export function NewItemModal({ categories, onItemCreated, trigger }: NewItemModalProps) {
  const [open, setOpen] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const newItem = createItem({
        name: formData.name.trim(),
        sku: formData.sku.trim() || undefined,
        category_id: formData.category_id === 'uncategorized' ? undefined : formData.category_id,
        unit: formData.unit,
        photo_url: formData.photo_url.trim() || undefined,
        location_name: formData.location_name.trim() || undefined,
        qty_on_hand: 0, // Start with 0, user can add initial stock via movement
        reorder_point: formData.reorder_point,
        min_qty: formData.min_qty,
        max_qty: formData.max_qty,
        unit_cost: formData.unit_cost,
        active: formData.active
      });

      onItemCreated(newItem);
      toast.success('Item criado com sucesso');
      setOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        sku: '',
        category_id: 'uncategorized',
        unit: 'un',
        photo_url: '',
        location_name: '',
        reorder_point: 0,
        min_qty: undefined,
        max_qty: undefined,
        unit_cost: undefined,
        active: true
      });
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Erro ao criar item');
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Novo Item
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Item de Estoque</DialogTitle>
          <DialogDescription>
            Adicione um novo item ao inventário. O estoque inicial será 0 - use a função "Movimentar" para adicionar quantidade inicial.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Filtro de Ar G4 - 610x610x48mm"
                required
                minLength={3}
              />
            </div>

            {/* SKU */}
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Ex: FLT-G4-610"
              />
            </div>

            {/* Categoria */}
            <div>
              <Label htmlFor="category">Categoria</Label>
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
              <Label htmlFor="unit">Unidade</Label>
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
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                placeholder="Ex: Prateleira A-1"
              />
            </div>

            {/* Ponto de Reposição */}
            <div>
              <Label htmlFor="reorder-point">Ponto de Reposição *</Label>
              <Input
                id="reorder-point"
                type="number"
                min="0"
                value={formData.reorder_point}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            {/* Quantidade Mínima */}
            <div>
              <Label htmlFor="min-qty">Quantidade Mínima</Label>
              <Input
                id="min-qty"
                type="number"
                min="0"
                value={formData.min_qty || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, min_qty: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Opcional"
              />
            </div>

            {/* Quantidade Máxima */}
            <div>
              <Label htmlFor="max-qty">Quantidade Máxima</Label>
              <Input
                id="max-qty"
                type="number"
                min="0"
                value={formData.max_qty || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, max_qty: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Opcional"
              />
            </div>

            {/* Custo Unitário */}
            <div>
              <Label htmlFor="unit-cost">Custo Unitário (R$)</Label>
              <Input
                id="unit-cost"
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
              <Label htmlFor="photo-url">URL da Foto</Label>
              <Input
                id="photo-url"
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
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked as boolean }))}
            />
            <Label htmlFor="active">Item ativo</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}