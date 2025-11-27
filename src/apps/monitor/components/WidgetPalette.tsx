/**
 * WidgetPalette - Paleta para adicionar novos widgets
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Activity, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Wrench, 
  Heart, 
  BarChart3, 
  LineChart,
  Table
} from 'lucide-react';
import { WidgetType, WidgetCategory } from '../types/dashboard';

interface WidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  category: WidgetCategory;
  icon: React.ReactNode;
}

const widgetDefinitions: WidgetDefinition[] = [
  // KPIs
  {
    id: 'card-kpi',
    name: 'Uptime Dispositivos',
    description: 'Percentual de disponibilidade com tendência',
    category: 'reliability',
    icon: <Activity className="w-5 h-5 text-green-600" />
  },
  {
    id: 'card-kpi',
    name: 'Alertas Ativos',
    description: 'Quantidade de alertas pendentes',
    category: 'reliability',
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />
  },
  {
    id: 'card-kpi',
    name: 'Consumo Energético',
    description: 'Consumo do dia com variação',
    category: 'energy',
    icon: <Zap className="w-5 h-5 text-yellow-600" />
  },
  {
    id: 'card-kpi',
    name: 'Health Score',
    description: 'Score consolidado de saúde',
    category: 'reliability',
    icon: <Heart className="w-5 h-5 text-pink-600" />
  },
  {
    id: 'card-kpi',
    name: 'MTBF',
    description: 'Mean Time Between Failures',
    category: 'reliability',
    icon: <Clock className="w-5 h-5 text-blue-600" />
  },
  {
    id: 'card-kpi',
    name: 'MTTR',
    description: 'Mean Time To Repair',
    category: 'operations',
    icon: <Wrench className="w-5 h-5 text-orange-600" />
  },
  
  // Gráficos
  {
    id: 'chart-bar',
    name: 'Gráfico de Barras',
    description: 'Comparativo de consumo energético',
    category: 'charts',
    icon: <BarChart3 className="w-5 h-5 text-indigo-600" />
  },
  {
    id: 'chart-line',
    name: 'Gráfico de Linha',
    description: 'Tendência ao longo do tempo',
    category: 'charts',
    icon: <LineChart className="w-5 h-5 text-cyan-600" />
  },
  
  // Tabelas
  {
    id: 'table-alerts',
    name: 'Tabela de Alertas',
    description: 'Lista de alertas recentes',
    category: 'tables',
    icon: <Table className="w-5 h-5 text-gray-600" />
  }
];

const categoryLabels: Record<WidgetCategory, string> = {
  kpi: 'KPIs',
  operations: 'Operações',
  energy: 'Energia',
  reliability: 'Confiabilidade',
  charts: 'Gráficos',
  tables: 'Tabelas',
  management: 'Gestão'
};

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType, title: string) => void;
}

export function WidgetPalette({ onAddWidget }: WidgetPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredWidgets = widgetDefinitions.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (widget: WidgetDefinition) => {
    onAddWidget(widget.id, widget.name);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Widget</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar widgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredWidgets.map((widget, index) => (
              <button
                key={`${widget.id}-${index}`}
                onClick={() => handleSelect(widget)}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-muted">
                  {widget.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{widget.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[widget.category]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {widget.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
