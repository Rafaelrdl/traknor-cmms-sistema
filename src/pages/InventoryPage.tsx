import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { InventoryTabs } from '@/components/inventory/InventoryTabs';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryCards } from '@/components/inventory/InventoryCards';
import { InventoryAnalysis } from '@/components/inventory/InventoryAnalysis';
import { NewItemModal } from '@/components/inventory/NewItemModal';
import { EditItemModal } from '@/components/inventory/EditItemModal';
import { MoveItemModal } from '@/components/inventory/MoveItemModal';
import type { InventoryItem, InventoryCategory } from '@/models/inventory';
import { loadItems, loadCategories, searchItems, deleteItem } from '@/data/inventoryStore';

export function InventoryPage() {
  // State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  
  // Modal states
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [movingItem, setMovingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedItems = loadItems();
    const loadedCategories = loadCategories();
    setItems(loadedItems);
    setCategories(loadedCategories);
  }, []);

  // Filter items when search/filters change
  useEffect(() => {
    const filtered = searchItems(searchQuery, {
      category_id: selectedCategory || undefined,
      active: showActiveOnly
    });
    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategory, showActiveOnly]);

  // Handlers
  const handleItemCreated = (newItem: InventoryItem) => {
    setItems(prev => [...prev, newItem]);
    toast.success('Item adicionado ao inventário');
  };

  const handleItemUpdated = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    toast.success('Item atualizado');
  };

  const handleItemMoved = () => {
    // Refresh items from storage to get updated quantities
    const refreshedItems = loadItems();
    setItems(refreshedItems);
    toast.success('Estoque atualizado');
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    
    try {
      deleteItem(deletingItem.id);
      setItems(prev => prev.filter(item => item.id !== deletingItem.id));
      toast.success('Item removido do inventário');
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao remover item');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
  };

  const handleMove = (item: InventoryItem) => {
    setMovingItem(item);
  };

  const handleDelete = (item: InventoryItem) => {
    setDeletingItem(item);
  };

  // Prepare tabs content
  const tabs = [
    {
      value: 'table' as const,
      label: 'Tabela',
      content: (
        <InventoryTable
          items={filteredItems}
          categories={categories}
          onEdit={handleEdit}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      )
    },
    {
      value: 'cards' as const,
      label: 'Cards',
      content: (
        <InventoryCards
          items={filteredItems}
          categories={categories}
          onEdit={handleEdit}
          onMove={handleMove}
        />
      )
    },
    {
      value: 'analysis' as const,
      label: 'Análise',
      content: <InventoryAnalysis />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Controle de Estoque">
        <NewItemModal
          categories={categories}
          onItemCreated={handleItemCreated}
        />
      </PageHeader>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Itens de Estoque
            </CardTitle>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative min-w-0 flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar itens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Active Filter */}
              <Select 
                value={showActiveOnly ? 'active' : 'all'} 
                onValueChange={(value) => setShowActiveOnly(value === 'active')}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InventoryTabs tabs={tabs} />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditItemModal
        item={editingItem}
        categories={categories}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onItemUpdated={handleItemUpdated}
      />

      {/* Move Modal */}
      <MoveItemModal
        item={movingItem}
        open={!!movingItem}
        onOpenChange={(open) => !open && setMovingItem(null)}
        onItemMoved={handleItemMoved}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item "{deletingItem?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}