import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Package } from 'lucide-react';
import { IfCanEdit, IfCanMove } from '@/components/auth/IfCan';
import type { InventoryItem, InventoryCategory } from '@/models/inventory';

interface InventoryCardsProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  onEdit: (item: InventoryItem) => void;
  onMove: (item: InventoryItem) => void;
}

export function InventoryCards({ items, categories, onEdit, onMove }: InventoryCardsProps) {
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria desconhecida';
  };

  const isLowStock = (item: InventoryItem) => item.qty_on_hand < item.reorder_point;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum item encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="location-card overflow-hidden">
          <CardContent className="p-4">
            {/* Image */}
            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {item.photo_url ? (
                <img 
                  src={item.photo_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm leading-tight line-clamp-2" title={item.name}>
                  {item.name}
                </h3>
                {isLowStock(item) && (
                  <AlertTriangle 
                    className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" 
                    aria-label="Abaixo do ponto de reposição"
                  />
                )}
              </div>

              {item.sku && (
                <p className="text-xs text-muted-foreground font-mono">
                  {item.sku}
                </p>
              )}

              <Badge variant="outline" className="text-xs">
                {getCategoryName(item.category_id)}
              </Badge>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold">
                      {item.qty_on_hand}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.unit}
                    </span>
                  </div>
                  {isLowStock(item) && (
                    <span className="text-xs text-destructive font-medium">
                      Abaixo do ponto de reposição
                    </span>
                  )}
                </div>
                
                {item.location_name && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {item.location_name}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <IfCanMove subject="inventory">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onMove(item)}
                    aria-label={`Movimentar ${item.name}`}
                    data-testid="inventory-move"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Movimentar
                  </Button>
                </IfCanMove>
                <IfCanEdit subject="inventory">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(item)}
                    aria-label={`Editar ${item.name}`}
                    data-testid="inventory-edit"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </IfCanEdit>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}