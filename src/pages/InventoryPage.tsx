import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Warehouse, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { InventoryTabs } from '@/components/inventory/InventoryTabs';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryCards } from '@/components/inventory/InventoryCards';
import { InventoryAnalysis } from '@/components/inventory/InventoryAnalysis';
import { NewItemModal } from '@/components/inventory/NewItemModal';
import { EditItemModal } from '@/components/inventory/EditItemModal';
import { MoveItemModal } from '@/components/inventory/MoveItemModal';
import { IfCan } from '@/components/auth/IfCan';
import { useRoleBasedData, DataFilterInfo } from '@/components/data/FilteredDataProvider';
import { useAbility } from '@/hooks/useAbility';
import type { InventoryItem, InventoryCategory } from '@/models/inventory';
import { loadItems, loadCategories, searchItems, deleteItem } from '@/data/inventoryStore';

export function InventoryPage() {
  const { role } = useAbility();
  
  // State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  
  // Memoize the filter options to prevent infinite re-renders
  const filterOptions = useMemo(() => ({
    includeInactive: role === 'admin' || role === 'technician',
    onlyOwned: role === 'requester' // Requesters see limited inventory
  }), [role]);

  // Apply role-based filtering to inventory items
  const { data: filteredInventoryData, stats: inventoryFilterStats } = useRoleBasedData(
    items, 
    'inventory',
    filterOptions
  );
  
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>(filteredInventoryData);
  
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

  // Update filtered items when role-based data changes
  useEffect(() => {
    setFilteredItems(filteredInventoryData);
  }, [filteredInventoryData]);

  // Filter items when search/filters change (applied to already role-filtered data)
  useEffect(() => {
    const baseData = filteredInventoryData;
    const filtered = searchItems(searchQuery, {
      category_id: selectedCategory === 'all' ? undefined : selectedCategory,
      active: showActiveOnly
    }, baseData); // Pass the role-filtered data as the base
    setFilteredItems(filtered);
  }, [filteredInventoryData, searchQuery, selectedCategory, showActiveOnly]);

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
        <IfCan action="create" subject="inventory">
          <NewItemModal
            categories={categories}
            onItemCreated={handleItemCreated}
            trigger={
              <Button className="flex items-center gap-2" data-testid="inventory-create">
                <Plus className="h-4 w-4" />
                Novo Item
              </Button>
            }
          />
        </IfCan>
      </PageHeader>
      
      {/* Role-based data filtering info */}
      {inventoryFilterStats.filtered > 0 && (
        <DataFilterInfo
          filterStats={inventoryFilterStats}
          dataType="inventory"
          canViewAll={role === 'admin'}
        />
      )}

      {/* Special notice for requesters */}
      {role === 'requester' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Visualização limitada do estoque</p>
                <p className="mt-1">
                  Como solicitante, você pode ver os itens básicos do estoque mas não as quantidades detalhadas. 
                  Entre em contato com um técnico ou administrador para informações específicas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Itens de Estoque
              {role !== 'admin' && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {role === 'requester' ? 'Vista limitada' : 'Filtrado'}
                </Badge>
              )}
              {filteredItems.length !== items.length && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {filteredItems.length} de {items.length}
                </Badge>
              )}
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
                  <SelectItem value="all">Todas</SelectItem>
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