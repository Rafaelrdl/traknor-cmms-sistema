import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Package, Trash2 } from 'lucide-react';
import type { InventoryItem, InventoryCategory } from '@/models/inventory';

interface InventoryTableProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  onEdit: (item: InventoryItem) => void;
  onMove: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryTable({ items, categories, onEdit, onMove, onDelete }: InventoryTableProps) {
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria desconhecida';
  };

  const isLowStock = (item: InventoryItem) => item.qty_on_hand < item.reorder_point;

  const getStockBadge = (item: InventoryItem) => {
    if (item.qty_on_hand <= 0) {
      return <Badge variant="destructive">Esgotado</Badge>;
    }
    
    if (item.qty_on_hand < item.reorder_point) {
      return <Badge variant="destructive">Baixo</Badge>;
    }
    
    if (item.min_qty && item.qty_on_hand <= item.min_qty) {
      return <Badge variant="secondary">Crítico</Badge>;
    }
    
    return <Badge variant="outline">Normal</Badge>;
  };

  const formatLastUpdate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum item encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Foto</TableHead>
            <TableHead scope="col">Item/Descrição</TableHead>
            <TableHead scope="col">SKU</TableHead>
            <TableHead scope="col">Categoria</TableHead>
            <TableHead scope="col">Unid.</TableHead>
            <TableHead scope="col" className="text-right">Estoque</TableHead>
            <TableHead scope="col" className="text-right">Ponto de Reposição</TableHead>
            <TableHead scope="col">Local</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Atualizado em</TableHead>
            <TableHead scope="col" className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow 
              key={item.id}
              className={isLowStock(item) ? 'bg-destructive/5' : ''}
            >
              <TableCell>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {item.photo_url ? (
                    <img 
                      src={item.photo_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {item.name}
                  </div>
                  {item.location_name && (
                    <div className="text-xs text-muted-foreground">
                      {item.location_name}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">
                  {item.sku || '-'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {getCategoryName(item.category_id)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {item.unit}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="font-medium">
                    {item.qty_on_hand}
                  </span>
                  {isLowStock(item) && (
                    <AlertTriangle 
                      className="h-4 w-4 text-destructive" 
                      aria-label="Abaixo do ponto de reposição"
                    />
                  )}
                </div>
                {isLowStock(item) && (
                  <div className="text-xs text-destructive mt-1">
                    Abaixo do ponto de reposição
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <span className="font-medium">
                  {item.reorder_point}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {item.location_name || '-'}
                </span>
              </TableCell>
              <TableCell>
                {getStockBadge(item)}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatLastUpdate(item.last_movement_at || item.updated_at)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onMove(item)}
                    aria-label={`Movimentar ${item.name}`}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(item)}
                    aria-label={`Editar ${item.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(item)}
                    aria-label={`Excluir ${item.name}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}