import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Warehouse, Search, Plus, AlertTriangle } from 'lucide-react';
import { useStock } from '@/hooks/useData';
import type { StockItem } from '@/types';

export function InventoryPage() {
  const [stock] = useStock();

  const getStockStatus = (item: StockItem) => {
    if (item.quantity <= item.minimum) return 'critical';
    if (item.quantity <= item.minimum * 1.5) return 'low';
    return 'normal';
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixo</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Controle de Estoque" 
        description="Gestão de peças e materiais para manutenção"
      >
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Item
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Itens em Estoque
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar itens..."
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Qtd. Atual</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Máximo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(stock || []).map((item) => {
                const status = getStockStatus(item);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.quantity}
                        {status === 'critical' && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.minimum}</TableCell>
                    <TableCell>{item.maximum}</TableCell>
                    <TableCell>
                      {getStockBadge(status)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Movimentar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}