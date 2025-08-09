import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DonutChart } from '@/components/charts';
import { TrendingUp, Package2, AlertCircle } from 'lucide-react';
import type { AnalysisRange, ConsumptionByCategory } from '@/models/inventory';
import { computeConsumptionByCategory, loadItems, loadCategories } from '@/data/inventoryStore';

interface InventoryAnalysisProps {
  className?: string;
}

const RANGE_OPTIONS = [
  { value: '30d' as const, label: '30 dias' },
  { value: '90d' as const, label: '90 dias' },
  { value: '12m' as const, label: '12 meses' }
];

export function InventoryAnalysis({ className = '' }: InventoryAnalysisProps) {
  const [selectedRange, setSelectedRange] = useState<AnalysisRange>('90d');
  const [consumption, setConsumption] = useState<ConsumptionByCategory[]>(
    computeConsumptionByCategory(selectedRange)
  );

  const handleRangeChange = (value: AnalysisRange) => {
    setSelectedRange(value);
    setConsumption(computeConsumptionByCategory(value));
  };

  // Get top 5 most consumed items for the additional list
  const items = loadItems();
  const categories = loadCategories();
  
  const topItems = consumption
    .flatMap(cat => {
      const categoryItems = items.filter(item => item.category_id === cat.category_id);
      return categoryItems.map(item => ({
        ...item,
        categoryName: cat.category_name,
        consumed: Math.floor(Math.random() * cat.total_consumed) // Mock individual consumption
      }));
    })
    .sort((a, b) => b.consumed - a.consumed)
    .slice(0, 5);

  // Prepare data for donut chart
  const chartData = consumption.map(item => ({
    label: item.category_name,
    value: item.total_consumed,
    color: categories.find(c => c.id === item.category_id)?.color
  }));

  const totalConsumption = consumption.reduce((sum, item) => sum + item.total_consumed, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Análise de Consumo</h3>
        <Select value={selectedRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Consumo por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalConsumption > 0 ? (
              <DonutChart
                data={chartData}
                srDescriptionId="consumption-chart-desc"
                centerText={`${totalConsumption} itens`}
                size={240}
                strokeWidth={40}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Sem consumo registrado no período
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Selecione um período diferente ou registre movimentações
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Consumed Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5" />
              Itens Mais Consumidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topItems.length > 0 ? (
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.categoryName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-sm">
                        {item.consumed}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package2 className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">
                  Nenhum item consumido no período
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      {totalConsumption > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {consumption.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Categorias Utilizadas
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {totalConsumption}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total de Itens Consumidos
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(totalConsumption / consumption.length)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Média por Categoria
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}