/**
 * Tipos para o sistema de Dashboard Customizável
 * Baseado no design do TrakSense HVAC Monitor
 */

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'col-1' | 'col-2' | 'col-3' | 'col-4' | 'col-5' | 'col-6';
  position: {
    x: number;
    y: number;
    w?: number;
    h?: number;
  };
  config?: {
    // Configurações específicas do widget
    label?: string;
    unit?: string;
    color?: string;
    minValue?: number;
    maxValue?: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    chartType?: 'line' | 'bar' | 'area' | 'pie' | 'donut';
    timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
    refreshInterval?: number;
    decimals?: number;
    showIcon?: boolean;
    iconName?: string;
    // Dados vinculados
    dataSource?: string;
    equipmentId?: string;
    sectorId?: string;
    // Transformação de dados
    transform?: {
      formula?: string;
    };
    [key: string]: any;
  };
}

export type WidgetType = 
  // Cards KPI
  | 'card-kpi'              // Card KPI padrão com ícone e tendência
  | 'card-value'            // Card com valor único
  | 'card-stat'             // Card com estatística e trend
  | 'card-progress'         // Card com barra de progresso
  
  // Gráficos
  | 'chart-line'            // Gráfico de linha
  | 'chart-area'            // Gráfico de área
  | 'chart-bar'             // Gráfico de barras vertical
  | 'chart-bar-horizontal'  // Gráfico de barras horizontal
  | 'chart-pie'             // Gráfico de pizza
  | 'chart-donut'           // Gráfico de rosca (donut)
  
  // Medidores
  | 'gauge-circular'        // Medidor circular
  | 'gauge-progress'        // Barra de progresso
  
  // Indicadores
  | 'indicator-status'      // Indicador de status (LED)
  | 'indicator-trend'       // Indicador de tendência
  
  // Tabelas
  | 'table-simple'          // Tabela simples
  | 'table-work-orders'     // Tabela de OS
  | 'table-equipment'       // Tabela de equipamentos
  
  // Específicos CMMS
  | 'work-orders-summary'   // Resumo de OS
  | 'equipment-status'      // Status de equipamentos
  | 'maintenance-schedule'  // Agenda de manutenções
  | 'technician-performance'// Performance dos técnicos
  | 'sla-overview'          // Visão geral de SLA
  
  // Outros
  | 'text-display'          // Exibição de texto
  | 'photo-display';        // Exibição de imagem

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  category: 'kpis' | 'charts' | 'gauges' | 'tables' | 'cmms' | 'others';
  defaultSize: DashboardWidget['size'];
  icon: string;
  configurable: boolean;
  requiresData: boolean;
}

// Definições de widgets disponíveis
export const widgetDefinitions: WidgetDefinition[] = [
  // CARDS KPI
  {
    id: 'card-kpi',
    name: 'Card KPI',
    description: 'Card com valor, ícone e tendência',
    category: 'kpis',
    defaultSize: 'col-2',
    icon: 'Activity',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'card-value',
    name: 'Card Valor',
    description: 'Exibe um valor único',
    category: 'kpis',
    defaultSize: 'col-2',
    icon: 'Square',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'card-stat',
    name: 'Card Estatística',
    description: 'Valor com tendência e comparação',
    category: 'kpis',
    defaultSize: 'col-2',
    icon: 'TrendingUp',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'card-progress',
    name: 'Card Progresso',
    description: 'Barra de progresso com percentual',
    category: 'kpis',
    defaultSize: 'col-2',
    icon: 'BarChart2',
    configurable: true,
    requiresData: true,
  },

  // GRÁFICOS
  {
    id: 'chart-line',
    name: 'Gráfico de Linha',
    description: 'Linha temporal de dados',
    category: 'charts',
    defaultSize: 'col-4',
    icon: 'LineChart',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'chart-area',
    name: 'Gráfico de Área',
    description: 'Área preenchida temporal',
    category: 'charts',
    defaultSize: 'col-4',
    icon: 'AreaChart',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'chart-bar',
    name: 'Gráfico de Barras',
    description: 'Barras verticais',
    category: 'charts',
    defaultSize: 'col-4',
    icon: 'BarChart3',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'chart-bar-horizontal',
    name: 'Barras Horizontais',
    description: 'Barras na horizontal',
    category: 'charts',
    defaultSize: 'col-4',
    icon: 'BarChartHorizontal',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'chart-pie',
    name: 'Gráfico de Pizza',
    description: 'Pizza com percentuais',
    category: 'charts',
    defaultSize: 'col-3',
    icon: 'PieChart',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'chart-donut',
    name: 'Gráfico Donut',
    description: 'Rosca com centro vazio',
    category: 'charts',
    defaultSize: 'col-3',
    icon: 'Circle',
    configurable: true,
    requiresData: true,
  },

  // MEDIDORES
  {
    id: 'gauge-circular',
    name: 'Medidor Circular',
    description: 'Medidor circular completo',
    category: 'gauges',
    defaultSize: 'col-2',
    icon: 'Gauge',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'gauge-progress',
    name: 'Barra de Progresso',
    description: 'Barra de progresso horizontal',
    category: 'gauges',
    defaultSize: 'col-3',
    icon: 'Activity',
    configurable: true,
    requiresData: true,
  },

  // TABELAS
  {
    id: 'table-simple',
    name: 'Tabela Simples',
    description: 'Tabela de dados genérica',
    category: 'tables',
    defaultSize: 'col-6',
    icon: 'Table',
    configurable: true,
    requiresData: false,
  },
  {
    id: 'table-work-orders',
    name: 'Tabela de OS',
    description: 'Lista de ordens de serviço',
    category: 'tables',
    defaultSize: 'col-6',
    icon: 'ClipboardList',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'table-equipment',
    name: 'Tabela de Equipamentos',
    description: 'Lista de equipamentos',
    category: 'tables',
    defaultSize: 'col-6',
    icon: 'Server',
    configurable: true,
    requiresData: true,
  },

  // ESPECÍFICOS CMMS
  {
    id: 'work-orders-summary',
    name: 'Resumo de OS',
    description: 'Resumo de ordens de serviço',
    category: 'cmms',
    defaultSize: 'col-3',
    icon: 'ClipboardList',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'equipment-status',
    name: 'Status de Equipamentos',
    description: 'Visão geral dos equipamentos',
    category: 'cmms',
    defaultSize: 'col-3',
    icon: 'Server',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'maintenance-schedule',
    name: 'Agenda de Manutenções',
    description: 'Próximas manutenções programadas',
    category: 'cmms',
    defaultSize: 'col-4',
    icon: 'Calendar',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'technician-performance',
    name: 'Performance Técnicos',
    description: 'Métricas de desempenho',
    category: 'cmms',
    defaultSize: 'col-4',
    icon: 'Users',
    configurable: true,
    requiresData: true,
  },
  {
    id: 'sla-overview',
    name: 'Visão Geral SLA',
    description: 'Métricas de SLA',
    category: 'cmms',
    defaultSize: 'col-3',
    icon: 'Clock',
    configurable: true,
    requiresData: true,
  },

  // OUTROS
  {
    id: 'text-display',
    name: 'Exibição de Texto',
    description: 'Texto formatado',
    category: 'others',
    defaultSize: 'col-2',
    icon: 'Type',
    configurable: true,
    requiresData: false,
  },
  {
    id: 'photo-display',
    name: 'Exibição de Imagem',
    description: 'Imagem personalizada',
    category: 'others',
    defaultSize: 'col-3',
    icon: 'Image',
    configurable: true,
    requiresData: false,
  },
];

// Nomes de categorias em português
export const categoryNames: Record<string, string> = {
  'kpis': 'Cards KPI',
  'charts': 'Gráficos',
  'gauges': 'Medidores',
  'tables': 'Tabelas',
  'cmms': 'Específicos CMMS',
  'others': 'Outros',
};
