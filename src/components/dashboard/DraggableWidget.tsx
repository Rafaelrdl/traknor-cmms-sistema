import { useState, useMemo, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardWidget } from '@/types/dashboard';
import { useDashboardStore } from '@/store/useDashboardStore';
import { WidgetConfig } from './WidgetConfig';
import { ConfirmDialog } from '@/shared/ui/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as echarts from 'echarts';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  GripVertical, 
  X, 
  Settings,
  Activity, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ClipboardList,
  Server,
  Users,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Gauge,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Importar mapa de ícones do arquivo separado
import { kpiIconMap } from './kpiIcons';

// Hooks para dados reais
import { useWorkOrders, useWorkOrderStats } from '@/hooks/useWorkOrdersQuery';
import { useEquipments } from '@/hooks/useEquipmentQuery';
import { useSensorData, evaluateFormula, useMultiSensorHistory } from '@/hooks/useSensorData';

interface DraggableWidgetProps {
  widget: DashboardWidget;
  layoutId: string;
}

export function DraggableWidget({ widget, layoutId }: DraggableWidgetProps) {
  const editMode = useDashboardStore(state => state.editMode);
  const removeWidget = useDashboardStore(state => state.removeWidget);
  const [configOpen, setConfigOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<string>('24h'); // Período do gráfico
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set()); // Séries ocultas no gráfico

  // Refs para ECharts
  const echartsContainerRef = useRef<HTMLDivElement>(null);
  const echartsInstanceRef = useRef<echarts.ECharts | null>(null);

  // Dados reais do sistema
  const { data: workOrders = [] } = useWorkOrders();
  const { data: workOrderStats } = useWorkOrderStats();
  const { data: equipment = [] } = useEquipments();
  
  // Dados do sensor configurado
  const sensorTag = widget.config?.sensorTag;
  const sensorTags = widget.config?.sensorTags; // Array de tags para gráficos multi-série
  const assetId = widget.config?.assetId;
  const assetTag = widget.config?.assetTag; // Tag do asset para telemetria
  const sensorData = useSensorData(sensorTag, assetId, 30000);
  
  // Histórico de múltiplas variáveis para gráficos
  const chartTimeRange = chartPeriod === '1h' ? 1 
    : chartPeriod === '12h' ? 12 
    : chartPeriod === '24h' ? 24 
    : chartPeriod === '7d' ? 168 
    : chartPeriod === '30d' ? 720 
    : 24;
  
  console.log('📊 DraggableWidget - Params para useMultiSensorHistory:', {
    sensorTags,
    assetTag,
    chartTimeRange,
    widgetId: widget.id,
    widgetType: widget.type
  });
  
  const multiSensorHistory = useMultiSensorHistory(sensorTags, assetTag, chartTimeRange, 60000);
  
  console.log('📊 DraggableWidget - multiSensorHistory result:', {
    seriesCount: multiSensorHistory.series.length,
    loading: multiSensorHistory.loading,
    error: multiSensorHistory.error,
    widgetId: widget.id,
    series: multiSensorHistory.series.map(s => ({
      label: s.label,
      sensorTag: s.sensorTag,
      dataPoints: s.data.length,
      firstPoint: s.data[0],
      lastPoint: s.data[s.data.length - 1]
    }))
  });
  
  // Função para remover MAC address do nome da variável
  // Exemplo: "F80332010002C873_temperatura_retorno" -> "temperatura_retorno"
  const formatSensorLabel = (tag: string | undefined): string => {
    if (!tag) return '';
    // Se contém underscore, pegar tudo depois do primeiro underscore (remove o MAC)
    if (tag.includes('_')) {
      return tag.split('_').slice(1).join('_');
    }
    return tag;
  };

  // Preparar dados para Recharts - DEVE estar no nível superior (regras dos hooks)
  const chartData = useMemo(() => {
    console.log('📊 chartData useMemo executando:', {
      seriesLength: multiSensorHistory.series?.length || 0,
      series: multiSensorHistory.series
    });
    
    if (!multiSensorHistory.series || multiSensorHistory.series.length === 0) {
      console.log('📊 chartData: Sem séries, retornando []');
      return [];
    }

    // Coletar todos os timestamps únicos
    const allTimestamps = new Set<number>();
    multiSensorHistory.series.forEach(serie => {
      serie.data.forEach(point => {
        allTimestamps.add(point.timestamp.getTime());
      });
    });

    console.log('📊 chartData: Timestamps únicos coletados:', allTimestamps.size);

    // Ordenar timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    // Criar objetos com todos os valores
    const data = sortedTimestamps.map(ts => {
      const point: Record<string, any> = { 
        timestamp: ts,
        timeLabel: new Date(ts).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      multiSensorHistory.series.forEach(serie => {
        const dataPoint = serie.data.find(d => d.timestamp.getTime() === ts);
        point[serie.label] = dataPoint?.value ?? null;
      });
      
      return point;
    });
    
    console.log('📊 chartData gerado:', {
      pointsCount: data.length,
      firstPoint: data[0],
      lastPoint: data[data.length - 1]
    });
    
    return data;
  }, [multiSensorHistory.series]);
  
  // Effect para gerenciar ECharts (apenas para chart-line-echarts)
  useEffect(() => {
    console.log('📊 ECharts useEffect executando:', {
      widgetType: widget.type,
      hasContainer: !!echartsContainerRef.current,
      sensorTags,
      assetTag,
      seriesLength: multiSensorHistory.series.length,
      chartDataLength: chartData.length
    });

    // Só executar para widgets ECharts
    if (widget.type !== 'chart-line-echarts' && widget.type !== 'chart-area') {
      console.log('📊 ECharts: Tipo de widget não é chart-line-echarts ou chart-area');
      return;
    }
    
    if (!echartsContainerRef.current) {
      console.log('📊 ECharts: Container ref não está disponível ainda');
      return;
    }

    // Inicializar instância do ECharts
    if (!echartsInstanceRef.current) {
      console.log('📊 ECharts: Inicializando instância do ECharts');
      echartsInstanceRef.current = echarts.init(echartsContainerRef.current);
    }

    // Se tem sensores configurados e dados disponíveis
    if (sensorTags && sensorTags.length > 0 && assetTag && multiSensorHistory.series.length > 0 && chartData.length > 0) {
      console.log('📊 ECharts: Preparando dados para renderizar gráfico', {
        hiddenSeriesCount: hiddenSeries.size,
        hiddenSeries: Array.from(hiddenSeries)
      });
      
      // Preparar dados para ECharts
      const timestamps = chartData.map(point => 
        new Date(point.timestamp).toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        })
      );

      // Mapear TODAS as séries, mas controlar visibilidade através da propriedade 'show'
      const seriesData = multiSensorHistory.series.map(serie => {
        const isHidden = hiddenSeries.has(serie.label);
        console.log(`📊 Série "${serie.label}":`, { isHidden });
        
        // Configuração base da série
        const serieConfig: any = {
          name: serie.label,
          type: 'line' as const,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2.5,
            opacity: isHidden ? 0 : 1,
          },
          itemStyle: {
            color: serie.color,
            opacity: isHidden ? 0 : 1,
          },
          data: chartData.map(point => point[serie.label]),
          silent: isHidden,
        };

        // Se for gráfico de área, adicionar preenchimento
        if (widget.type === 'chart-area') {
          serieConfig.areaStyle = {
            opacity: isHidden ? 0 : 0.3, // Área com 30% de opacidade quando visível
            color: serie.color,
          };
        }

        return serieConfig;
      });

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: {
            color: '#333',
            fontSize: 12
          },
          formatter: (params: any) => {
            if (!Array.isArray(params)) return '';
            let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
            params.forEach((param: any) => {
              // Pular séries ocultas no tooltip
              const serieLabel = param.seriesName;
              if (hiddenSeries.has(serieLabel)) return;
              
              const value = typeof param.value === 'number' ? param.value.toFixed(2) : param.value;
              tooltip += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color};margin-right:5px;"></span>${param.seriesName}: <strong>${value}</strong><br/>`;
            });
            return tooltip;
          }
        },
        legend: {
          show: false // Esconder legenda do ECharts, usar no header
        },
        grid: {
          left: '60px',
          right: '30px',
          bottom: '40px',
          top: '20px',
          containLabel: false
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: timestamps,
          axisLabel: {
            fontSize: 11,
            color: '#666',
            rotate: 45
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 11,
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#eee',
              type: 'dashed'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        series: seriesData
      };

      console.log('📊 ECharts: Setando opções do gráfico:', {
        timestamps: timestamps.length,
        seriesData: seriesData.length,
        visibleSeries: seriesData.filter((s: any) => !s.silent).length,
        hiddenSeriesCount: hiddenSeries.size
      });

      // Usar setOption com notMerge: true para forçar re-renderização completa
      echartsInstanceRef.current.setOption(option, {
        notMerge: true, // Não fazer merge, substituir completamente
        replaceMerge: ['series'], // Substituir array de séries
      });
      
      console.log('📊 ECharts: Gráfico renderizado com sucesso');
    }

    // Cleanup e resize
    const handleResize = () => {
      echartsInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [widget.type, chartData, multiSensorHistory.series, hiddenSeries, sensorTags, assetTag]);

  // Cleanup da instância ECharts ao desmontar
  useEffect(() => {
    return () => {
      if (widget.type === 'chart-line-echarts' || widget.type === 'chart-area') {
        echartsInstanceRef.current?.dispose();
        echartsInstanceRef.current = null;
      }
    };
  }, [widget.type]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'col-1': return 'col-span-1 lg:col-span-1';
      case 'col-2': return 'col-span-1 lg:col-span-2';
      case 'col-3': return 'col-span-1 lg:col-span-3';
      case 'col-4': return 'col-span-1 lg:col-span-4';
      case 'col-5': return 'col-span-1 lg:col-span-5';
      case 'col-6': return 'col-span-1 lg:col-span-6';
      default: return 'col-span-1 lg:col-span-2';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    removeWidget(layoutId, widget.id);
  };

  const handleConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfigOpen(true);
  };

  // Renderizar conteúdo baseado no tipo de widget
  const renderWidgetContent = () => {
    switch (widget.type) {
      // CARDS KPI
      case 'card-kpi':
        return renderKPICard();
      case 'card-value':
        return renderValueCard();
      case 'card-stat':
        return renderStatCard();
      case 'card-progress':
        return renderProgressCard();

      // GRÁFICOS
      case 'chart-line-echarts':
        return renderLineChartECharts();
      case 'chart-area':
        return renderAreaChartECharts();
      case 'chart-bar':
      case 'chart-bar-horizontal':
        return renderBarChart();
      case 'chart-pie':
      case 'chart-donut':
        return renderPieChart();

      // MEDIDORES
      case 'gauge-circular':
        return renderGauge();
      case 'gauge-progress':
        return renderProgressGauge();

      // INDICADORES
      case 'indicator-status':
        return renderStatusIndicator();
      case 'indicator-trend':
        return renderTrendIndicator();

      // CARDS DE AÇÃO
      case 'card-button':
        return renderButtonCard();
      case 'card-toggle':
        return renderToggleCard();
      case 'card-status':
        return renderStatusCard();

      // TABELAS
      case 'table-simple':
        return renderSimpleTable();
      case 'table-work-orders':
        return renderWorkOrdersTable();
      case 'table-equipment':
        return renderEquipmentTable();

      // ESPECÍFICOS CMMS
      case 'technician-performance':
        return renderTechnicianPerformance();
      case 'sla-overview':
        return renderSLAOverview();

      // OUTROS
      case 'text-display':
        return renderTextDisplay();
      case 'photo-display':
        return renderPhotoDisplay();

      default:
        return renderPlaceholder();
    }
  };

  // === RENDERIZADORES DE WIDGETS ===

  // KPI Card com dados reais do sensor
  function renderKPICard() {
    // Verificar se o widget é pequeno (1 coluna)
    const isCompact = widget.size === 'col-1';

    // Se tiver um sensor configurado, usar dados do sensor
    if (sensorTag && assetId) {
      if (sensorData.isLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Carregando...</div>
          </div>
        );
      }

      if (sensorData.error) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangle className="w-6 h-6 text-destructive mb-2" />
            <div className="text-sm text-destructive">Erro ao carregar</div>
          </div>
        );
      }

      // Aplicar fórmula de transformação se houver
      let displayValue: string | number | null = sensorData.value;
      const formula = widget.config?.transform?.formula;
      if (formula && displayValue !== null && displayValue !== undefined) {
        const numericResult = evaluateFormula(formula, Number(displayValue));
        displayValue = numericResult;
      }

      // Formatar o valor
      const formattedValue = displayValue !== null && displayValue !== undefined
        ? typeof displayValue === 'number' 
          ? displayValue.toFixed(2)
          : String(displayValue)
        : '--';

      // Usar unidade configurada ou do sensor
      const unit = widget.config?.unit || sensorData.unit || '';
      const label = widget.config?.label || formatSensorLabel(sensorTag);

      // Determinar cor e ícone da tendência
      const getTrendDisplay = () => {
        if (!sensorData.trend) {
          // Sem dados de tendência, mostrar status online
          return {
            icon: sensorData.isOnline ? CheckCircle : XCircle,
            text: sensorData.isOnline ? 'Online' : 'Offline',
            colorClass: sensorData.isOnline ? 'text-green-600' : 'text-red-600',
          };
        }

        const { direction, percentage } = sensorData.trend;
        const formattedPercent = percentage.toFixed(1);

        switch (direction) {
          case 'up':
            return {
              icon: TrendingUp,
              text: `+${formattedPercent}% vs última hora`,
              colorClass: 'text-green-600',
            };
          case 'down':
            return {
              icon: TrendingDown,
              text: `-${formattedPercent}% vs última hora`,
              colorClass: 'text-red-600',
            };
          default:
            return {
              icon: Minus,
              text: 'Estável',
              colorClass: 'text-muted-foreground',
            };
        }
      };

      const trendDisplay = getTrendDisplay();
      const TrendIcon = trendDisplay.icon;

      // Obter o ícone configurado ou usar Activity como padrão
      const iconKey = widget.config?.iconName || 'activity';
      const SelectedIcon = kpiIconMap[iconKey] || Activity;

      return (
        <div className="flex flex-col items-center justify-center h-full p-2">
          {/* Layout horizontal: Ícone + Valor */}
          <div className="flex items-center gap-4">
            {/* Ícone */}
            <div className={cn(
              "rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0",
              isCompact ? "w-12 h-12" : "w-16 h-16"
            )}>
              <SelectedIcon className={cn(
                "text-primary",
                isCompact ? "w-6 h-6" : "w-9 h-9"
              )} />
            </div>

            {/* Valor e Unidade na mesma linha */}
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "font-bold text-foreground leading-none",
                isCompact ? "text-3xl" : "text-4xl"
              )}>
                {formattedValue}
              </span>
              {unit && (
                <span className={cn(
                  "font-medium text-muted-foreground",
                  isCompact ? "text-base" : "text-lg"
                )}>
                  {unit}
                </span>
              )}
            </div>
          </div>
          
          {/* Label */}
          <div className={cn(
            "text-muted-foreground text-center leading-tight",
            isCompact ? "text-xs mt-2" : "text-sm mt-3"
          )}>
            {label}
          </div>
          
          {/* Indicador de tendência */}
          <div className={cn(
            "flex items-center gap-1",
            isCompact ? "mt-1 text-xs" : "mt-2 text-sm",
            trendDisplay.colorClass
          )}>
            <TrendIcon className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
            <span className="font-medium">
              {isCompact && sensorData.trend 
                ? `${sensorData.trend.direction === 'up' ? '+' : sensorData.trend.direction === 'down' ? '-' : ''}${sensorData.trend.percentage.toFixed(1)}%` 
                : trendDisplay.text}
            </span>
          </div>
        </div>
      );
    }

    // Fallback para dados de Work Orders se não tiver sensor configurado
    const openWO = workOrderStats?.open ?? workOrders.filter(wo => wo.status === 'OPEN').length;
    
    // Obter o ícone configurado ou usar ClipboardList como padrão para WO
    const fallbackIconKey = widget.config?.iconName || 'activity';
    const FallbackIcon = kpiIconMap[fallbackIconKey] || ClipboardList;
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-2">
        {/* Layout horizontal: Ícone + Valor */}
        <div className="flex items-center gap-4">
          {/* Ícone */}
          <div className={cn(
            "rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0",
            isCompact ? "w-12 h-12" : "w-16 h-16"
          )}>
            <FallbackIcon className={cn(
              "text-primary",
              isCompact ? "w-6 h-6" : "w-9 h-9"
            )} />
          </div>

          {/* Valor */}
          <span className={cn(
            "font-bold text-foreground leading-none",
            isCompact ? "text-3xl" : "text-4xl"
          )}>
            {openWO}
          </span>
        </div>
        
        {/* Label */}
        <div className={cn(
          "text-muted-foreground text-center leading-tight",
          isCompact ? "text-xs mt-2" : "text-sm mt-3"
        )}>
          {widget.config?.label || 'OS em Aberto'}
        </div>
        
        {/* Indicador de tendência */}
        <div className={cn(
          "flex items-center gap-1 text-green-600",
          isCompact ? "mt-1 text-xs" : "mt-2 text-sm"
        )}>
          <TrendingDown className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
          <span className="font-medium">-12% vs semana anterior</span>
        </div>
      </div>
    );
  }

  function renderValueCard() {
    // Se tiver sensor configurado, usar dados do sensor
    if (sensorTag && assetId && sensorData.value !== null) {
      let displayValue: string | number | null = sensorData.value;
      const formula = widget.config?.transform?.formula;
      if (formula && displayValue !== null) {
        displayValue = evaluateFormula(formula, Number(displayValue));
      }

      const formattedValue = typeof displayValue === 'number' 
        ? displayValue.toFixed(2) 
        : String(displayValue ?? '0');

      const unit = widget.config?.unit || sensorData.unit || '';
      const label = widget.config?.label || formatSensorLabel(sensorTag);

      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-3xl font-bold text-foreground">
            {formattedValue}
            {unit && <span className="text-lg ml-1 font-normal text-muted-foreground">{unit}</span>}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {label}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-3xl font-bold text-foreground">
          {widget.config?.value || '0'}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {widget.config?.label || 'Valor'}
        </div>
      </div>
    );
  }

  function renderStatCard() {
    // Verificar se o widget é pequeno (1 coluna)
    const isCompact = widget.size === 'col-1';

    // Se tiver um sensor configurado, usar dados do sensor
    if (sensorTag && assetId) {
      if (sensorData.isLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Carregando...</div>
          </div>
        );
      }

      if (sensorData.error) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangle className="w-6 h-6 text-destructive mb-2" />
            <div className="text-sm text-destructive">Erro ao carregar</div>
          </div>
        );
      }

      // Aplicar fórmula de transformação se houver
      let displayValue: string | number | null = sensorData.value;
      const formula = widget.config?.transform?.formula;
      if (formula && displayValue !== null && displayValue !== undefined) {
        const numericResult = evaluateFormula(formula, Number(displayValue));
        displayValue = numericResult;
      }

      // Formatar o valor
      const formattedValue = displayValue !== null && displayValue !== undefined
        ? typeof displayValue === 'number' 
          ? displayValue.toFixed(2)
          : String(displayValue)
        : '--';

      // Usar unidade configurada ou do sensor
      const unit = widget.config?.unit || sensorData.unit || '';
      const label = widget.config?.label || formatSensorLabel(sensorTag);

      // Determinar cor e ícone da tendência
      const getTrendDisplay = () => {
        if (!sensorData.trend) {
          return {
            icon: sensorData.isOnline ? CheckCircle : XCircle,
            text: sensorData.isOnline ? 'Online' : 'Offline',
            colorClass: sensorData.isOnline ? 'text-green-600' : 'text-red-600',
          };
        }

        const { direction, percentage } = sensorData.trend;
        const formattedPercent = percentage.toFixed(1);

        switch (direction) {
          case 'up':
            return {
              icon: TrendingUp,
              text: `+${formattedPercent}% vs última hora`,
              colorClass: 'text-green-600',
            };
          case 'down':
            return {
              icon: TrendingDown,
              text: `-${formattedPercent}% vs última hora`,
              colorClass: 'text-red-600',
            };
          default:
            return {
              icon: Minus,
              text: 'Estável',
              colorClass: 'text-muted-foreground',
            };
        }
      };

      const trendDisplay = getTrendDisplay();
      const TrendIcon = trendDisplay.icon;

      return (
        <div className="flex flex-col items-center justify-center h-full py-2">
          {/* Valor principal */}
          <div className={cn(
            "font-bold text-foreground flex items-baseline justify-center flex-wrap gap-1",
            isCompact ? "text-2xl" : "text-3xl"
          )}>
            <span>{formattedValue}</span>
            {unit && (
              <span className={cn(
                "font-normal text-muted-foreground",
                isCompact ? "text-sm" : "text-base"
              )}>
                {unit}
              </span>
            )}
          </div>
          
          {/* Label */}
          <div className={cn(
            "text-muted-foreground text-center leading-tight",
            isCompact ? "text-xs mt-1" : "text-sm mt-1"
          )}>
            {label}
          </div>
          
          {/* Indicador de tendência */}
          <div className={cn(
            "flex items-center gap-1 text-xs",
            isCompact ? "mt-1" : "mt-2",
            trendDisplay.colorClass
          )}>
            <TrendIcon className="w-3 h-3 flex-shrink-0" />
            <span>{isCompact && sensorData.trend ? `${sensorData.trend.direction === 'up' ? '+' : sensorData.trend.direction === 'down' ? '-' : ''}${sensorData.trend.percentage.toFixed(1)}%` : trendDisplay.text}</span>
          </div>
        </div>
      );
    }

    // Fallback para dados de Work Orders se não tiver sensor configurado
    const completedWO = workOrderStats?.completed ?? workOrders.filter(wo => wo.status === 'COMPLETED').length;
    return (
      <div className="flex flex-col items-center justify-center h-full py-2">
        <div className={cn(
          "font-bold text-foreground",
          isCompact ? "text-2xl" : "text-3xl"
        )}>
          {completedWO}
        </div>
        <div className={cn(
          "text-muted-foreground text-center leading-tight",
          isCompact ? "text-xs mt-1" : "text-sm mt-1"
        )}>
          {widget.config?.label || 'Concluídas'}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs text-green-600",
          isCompact ? "mt-1" : "mt-2"
        )}>
          <TrendingUp className="w-3 h-3" />
          <span>+8% este mês</span>
        </div>
      </div>
    );
  }

  function renderProgressCard() {
    // Se tiver sensor configurado, usar dados do sensor
    if (sensorTag && assetId) {
      if (sensorData.isLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Carregando...</div>
          </div>
        );
      }

      // Obter valor atual do sensor
      let currentValue: number = sensorData.value !== null ? Number(sensorData.value) : 0;
      
      // Aplicar fórmula de transformação se houver
      const formula = widget.config?.transform?.formula;
      if (formula && currentValue !== null) {
        const transformedValue = evaluateFormula(formula, currentValue);
        currentValue = typeof transformedValue === 'number' ? transformedValue : Number(transformedValue) || 0;
      }

      // Obter valores min/max da configuração
      const minValue = widget.config?.minValue ?? 0;
      const maxValue = widget.config?.maxValue ?? 100;
      
      // Calcular percentual baseado no range configurado
      const range = maxValue - minValue;
      const normalizedValue = currentValue - minValue;
      const percent = range > 0 ? Math.round((normalizedValue / range) * 100) : 0;
      const clampedPercent = Math.max(0, Math.min(100, percent));
      
      // Determinar cor baseado no percentual
      const getProgressColor = () => {
        if (clampedPercent >= 75) return 'bg-green-500';
        if (clampedPercent >= 50) return 'bg-primary';
        if (clampedPercent >= 25) return 'bg-yellow-500';
        return 'bg-orange-500';
      };

      const unit = widget.config?.unit || sensorData.unit || '';
      const label = widget.config?.label || formatSensorLabel(sensorTag);
      const decimals = widget.config?.decimals ?? 2;
      const formattedValue = typeof currentValue === 'number' 
        ? currentValue.toFixed(decimals) 
        : String(currentValue);
      
      return (
        <div className="flex flex-col justify-between h-full p-2">
          {/* Valor principal no topo */}
          <div className="text-center">
            <span className="text-2xl font-bold text-foreground">{formattedValue}</span>
            <span className="text-sm text-muted-foreground ml-1">{unit}</span>
          </div>
          
          {/* Label */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground truncate">{label}</div>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{minValue}</span>
              <span className="font-medium">{clampedPercent}%</span>
              <span>{maxValue}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-primary"
                style={{ width: `${Math.max(clampedPercent, 2)}%` }}
              />
            </div>
          </div>
        </div>
      );
    }

    // Fallback para dados de Work Orders se não tiver sensor configurado
    const total = workOrders.length || 1;
    const completed = workOrders.filter(wo => wo.status === 'COMPLETED').length;
    const percent = Math.round((completed / total) * 100);
    
    return (
      <div className="flex flex-col justify-between h-full p-2">
        {/* Valor principal no topo */}
        <div className="text-center">
          <span className="text-2xl font-bold text-foreground">{percent}%</span>
        </div>
        
        {/* Label */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{completed} de {total} concluídas</div>
        </div>
        
        {/* Barra de progresso */}
        <div className="w-full">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-primary"
              style={{ width: `${Math.max(percent, 2)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Estado para o toggle
  const [toggleState, setToggleState] = useState(false);

  function renderButtonCard() {
    const label = widget.config?.label || formatSensorLabel(sensorTag) || widget.title;
    const buttonColor = widget.config?.color || '#3b82f6';
    
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-3">
        <h3 className="text-xs font-medium text-muted-foreground text-center">{label}</h3>
        <button 
          className="px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm"
          style={{ backgroundColor: buttonColor }}
          onClick={() => {
            // Aqui pode ser implementada a ação do botão
            console.log('Botão clicado:', widget.id);
          }}
        >
          Executar
        </button>
      </div>
    );
  }

  function renderToggleCard() {
    const label = widget.config?.label || formatSensorLabel(sensorTag) || widget.title;
    
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-3">
        <h3 className="text-xs font-medium text-muted-foreground text-center">{label}</h3>
        <button
          onClick={() => setToggleState(!toggleState)}
          className={cn(
            "relative w-14 h-7 rounded-full transition-colors",
            toggleState ? "bg-green-500" : "bg-gray-300"
          )}
        >
          <div 
            className={cn(
              "absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm",
              toggleState && "translate-x-7"
            )}
          />
        </button>
        <span className={cn(
          "text-sm font-medium",
          toggleState ? "text-green-600" : "text-muted-foreground"
        )}>
          {toggleState ? 'Ligado' : 'Desligado'}
        </span>
      </div>
    );
  }

  function renderStatusCard() {
    const label = widget.config?.label || formatSensorLabel(sensorTag) || widget.title;
    
    // Usar valor do sensor se disponível
    let statusValue = 50;
    if (sensorTag && assetId && sensorData.value !== null) {
      statusValue = Number(sensorData.value);
    }
    
    // Determinar status baseado nos thresholds ou valor padrão
    let status: string;
    let statusColor: string;
    let statusBgClass: string;
    
    const warningThreshold = widget.config?.warningThreshold;
    const criticalThreshold = widget.config?.criticalThreshold;
    
    if (criticalThreshold !== undefined || warningThreshold !== undefined) {
      // Usar thresholds configurados
      if (criticalThreshold !== undefined && statusValue >= criticalThreshold) {
        status = 'Crítico';
        statusColor = '#ef4444';
        statusBgClass = 'bg-red-50';
      } else if (warningThreshold !== undefined && statusValue >= warningThreshold) {
        status = 'Aviso';
        statusColor = '#f59e0b';
        statusBgClass = 'bg-yellow-50';
      } else {
        status = 'OK';
        statusColor = '#10b981';
        statusBgClass = 'bg-green-50';
      }
    } else {
      // Lógica padrão: porcentagem 0-100
      const normalizedValue = statusValue / 100;
      if (normalizedValue > 0.7) {
        status = 'OK';
        statusColor = '#10b981';
        statusBgClass = 'bg-green-50';
      } else if (normalizedValue > 0.4) {
        status = 'Aviso';
        statusColor = '#f59e0b';
        statusBgClass = 'bg-yellow-50';
      } else {
        status = 'Crítico';
        statusColor = '#ef4444';
        statusBgClass = 'bg-red-50';
      }
    }
    
    return (
      <div className={cn("h-full flex flex-col items-center justify-center gap-3 p-3 rounded-lg", statusBgClass)}>
        <h3 className="text-xs font-medium text-muted-foreground text-center">{label}</h3>
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${statusColor}20` }}
        >
          <span className="text-lg font-bold" style={{ color: statusColor }}>
            {sensorData.isLoading ? '...' : status}
          </span>
        </div>
      </div>
    );
  }

  function renderLineChartECharts() {
    console.log('📊 renderLineChartECharts executando:', {
      hasSensorTags: !!sensorTags,
      sensorTagsLength: sensorTags?.length || 0,
      hasAssetTag: !!assetTag,
      assetTag,
      loading: multiSensorHistory.loading,
      error: multiSensorHistory.error,
      seriesLength: multiSensorHistory.series.length
    });

    // Se tem sensores configurados, usar dados reais
    if (sensorTags && sensorTags.length > 0 && assetTag) {
      console.log('📊 ECharts: Condição principal atendida (tem sensorTags e assetTag)');
      
      if (multiSensorHistory.loading) {
        console.log('📊 ECharts: Estado = loading');
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        );
      }

      if (multiSensorHistory.error) {
        console.log('📊 ECharts: Estado = erro:', multiSensorHistory.error);
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-destructive text-sm">{multiSensorHistory.error}</div>
          </div>
        );
      }

      if (multiSensorHistory.series.length === 0 || multiSensorHistory.series.every(s => s.data.length === 0)) {
        console.log('📊 ECharts: Estado = sem dados no período');
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <LineChartIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <div className="text-muted-foreground text-sm">Sem dados no período</div>
          </div>
        );
      }

      console.log('📊 ECharts: Renderizando container do gráfico');

      return (
        <div 
          ref={echartsContainerRef} 
          className="h-full w-full" 
          style={{ minHeight: '200px' }}
        />
      );
    }

    // Fallback: dados mockados
    console.log('📊 ECharts: Caindo no fallback - Configure as variáveis');
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <LineChartIcon className="w-8 h-8 text-muted-foreground mb-2" />
        <div className="text-muted-foreground text-sm">Configure as variáveis</div>
      </div>
    );
  }

  function renderAreaChartECharts() {
    console.log('📊 renderAreaChartECharts executando:', {
      hasSensorTags: !!sensorTags,
      sensorTagsLength: sensorTags?.length || 0,
      hasAssetTag: !!assetTag,
      assetTag,
      loading: multiSensorHistory.loading,
      error: multiSensorHistory.error,
      seriesLength: multiSensorHistory.series.length
    });

    // Se tem sensores configurados, usar dados reais
    if (sensorTags && sensorTags.length > 0 && assetTag) {
      console.log('📊 Area ECharts: Condição principal atendida (tem sensorTags e assetTag)');
      
      if (multiSensorHistory.loading) {
        console.log('📊 Area ECharts: Estado = loading');
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        );
      }

      if (multiSensorHistory.error) {
        console.log('📊 Area ECharts: Estado = erro:', multiSensorHistory.error);
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-destructive text-sm">{multiSensorHistory.error}</div>
          </div>
        );
      }

      if (multiSensorHistory.series.length === 0 || multiSensorHistory.series.every(s => s.data.length === 0)) {
        console.log('📊 Area ECharts: Estado = sem dados no período');
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <LineChartIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <div className="text-muted-foreground text-sm">Sem dados no período</div>
          </div>
        );
      }

      console.log('📊 Area ECharts: Renderizando container do gráfico');

      return (
        <div 
          ref={echartsContainerRef} 
          className="h-full w-full" 
          style={{ minHeight: '200px' }}
        />
      );
    }

    // Fallback: dados mockados
    console.log('📊 Area ECharts: Caindo no fallback - Configure as variáveis');
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <LineChartIcon className="w-8 h-8 text-muted-foreground mb-2" />
        <div className="text-muted-foreground text-sm">Configure as variáveis</div>
      </div>
    );
  }

  function renderBarChart() {
    const openWO = workOrders.filter(wo => wo.status === 'OPEN').length;
    const inProgress = workOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
    const completed = workOrders.filter(wo => wo.status === 'COMPLETED').length;
    const max = Math.max(openWO, inProgress, completed, 1);

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span className="font-medium">Status das OS</span>
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Abertas</span>
              <span className="font-medium">{openWO}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full transition-all"
                style={{ width: `${(openWO / max) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Em Progresso</span>
              <span className="font-medium">{inProgress}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(inProgress / max) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Concluídas</span>
              <span className="font-medium">{completed}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(completed / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPieChart() {
    const functioning = equipment.filter(eq => eq.status === 'FUNCTIONING').length;
    const maintenance = equipment.filter(eq => eq.status === 'MAINTENANCE').length;
    const stopped = equipment.filter(eq => eq.status === 'STOPPED').length;
    const total = functioning + maintenance + stopped || 1;

    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-primary" />
          <span className="font-medium">Status dos Equipamentos</span>
        </div>
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="10" />
            <circle 
              cx="50" cy="50" r="40" fill="transparent" 
              stroke="#10b981" strokeWidth="10"
              strokeDasharray={`${(functioning / total) * 251.2} 251.2`}
              strokeDashoffset="0"
            />
            <circle 
              cx="50" cy="50" r="40" fill="transparent" 
              stroke="#f59e0b" strokeWidth="10"
              strokeDasharray={`${(maintenance / total) * 251.2} 251.2`}
              strokeDashoffset={`${-(functioning / total) * 251.2}`}
            />
            <circle 
              cx="50" cy="50" r="40" fill="transparent" 
              stroke="#ef4444" strokeWidth="10"
              strokeDasharray={`${(stopped / total) * 251.2} 251.2`}
              strokeDashoffset={`${-((functioning + maintenance) / total) * 251.2}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{total}</span>
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Ok ({functioning})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>Manut. ({maintenance})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Parado ({stopped})</span>
          </div>
        </div>
      </div>
    );
  }

  function renderGauge() {
    // Se tiver sensor configurado, usar dados do sensor
    let percent: number = Number(widget.config?.value) || 75;
    let label = widget.config?.label || 'Performance';
    let unit = '';

    if (sensorTag && assetId && sensorData.value !== null) {
      let displayValue: number = Number(sensorData.value);
      const formula = widget.config?.transform?.formula;
      if (formula) {
        const result = evaluateFormula(formula, displayValue);
        if (result !== null && typeof result === 'number') displayValue = result;
      }
      
      // Calcular porcentagem se tiver min/max configurados
      const min = widget.config?.min ?? 0;
      const max = widget.config?.max ?? 100;
      percent = Math.min(100, Math.max(0, ((displayValue - min) / (max - min)) * 100));
      label = widget.config?.label || formatSensorLabel(sensorTag);
      unit = widget.config?.unit || sensorData.unit || '';
    }

    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Gauge className="w-8 h-8 text-primary mb-2" />
        <div className="relative w-24 h-12 overflow-hidden">
          <div className="absolute w-24 h-24 border-8 border-muted rounded-full" />
          <div 
            className="absolute w-24 h-24 border-8 border-primary rounded-full transition-all"
            style={{ 
              clipPath: `polygon(0 100%, 100% 100%, 100% 50%, 0 50%)`,
              transform: `rotate(${(percent / 100) * 180 - 90}deg)`
            }}
          />
        </div>
        <div className="text-2xl font-bold mt-2">
          {sensorTag && assetId && sensorData.value !== null
            ? `${Number(sensorData.value).toFixed(1)}${unit ? ` ${unit}` : ''}`
            : `${percent}%`
          }
        </div>
        <div className="text-xs text-muted-foreground">
          {label}
        </div>
      </div>
    );
  }

  function renderProgressGauge() {
    const percent: number = Number(widget.config?.value) || 65;
    return (
      <div className="h-full flex flex-col justify-center">
        <div className="text-sm font-medium mb-2">
          {widget.config?.label || 'Progresso'}
        </div>
        <Progress value={percent} className="h-4" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>0%</span>
          <span className="font-medium text-foreground">{percent}%</span>
          <span>100%</span>
        </div>
      </div>
    );
  }

  function renderStatusIndicator() {
    const status = widget.config?.status || 'ok';
    const statusConfig = {
      ok: { color: 'bg-green-500', label: 'Operacional', icon: CheckCircle },
      warning: { color: 'bg-yellow-500', label: 'Atenção', icon: AlertCircle },
      error: { color: 'bg-red-500', label: 'Erro', icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ok;
    const Icon = config.icon;

    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", config.color)}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="text-lg font-medium mt-3">{config.label}</div>
        <div className="text-xs text-muted-foreground">
          {widget.config?.label || 'Sistema'}
        </div>
      </div>
    );
  }

  function renderTrendIndicator() {
    const trend = widget.config?.trend || 'up';
    const value = widget.config?.value || '+12%';
    const isUp = trend === 'up';

    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          isUp ? "bg-green-100" : "bg-red-100"
        )}>
          {isUp ? (
            <TrendingUp className="w-6 h-6 text-green-600" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div className={cn(
          "text-2xl font-bold mt-2",
          isUp ? "text-green-600" : "text-red-600"
        )}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground">
          {widget.config?.label || 'vs período anterior'}
        </div>
      </div>
    );
  }

  function renderSimpleTable() {
    return (
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Item 1</TableCell>
              <TableCell>100</TableCell>
              <TableCell><Badge>Ativo</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Item 2</TableCell>
              <TableCell>85</TableCell>
              <TableCell><Badge variant="secondary">Pendente</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderWorkOrdersTable() {
    const recentWO = workOrders.slice(0, 5);
    return (
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº OS</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentWO.map(wo => (
              <TableRow key={wo.id}>
                <TableCell className="font-medium">{wo.number}</TableCell>
                <TableCell>
                  <Badge variant={
                    wo.status === 'COMPLETED' ? 'default' :
                    wo.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                  }>
                    {wo.status === 'COMPLETED' ? 'Concluída' :
                     wo.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Aberta'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    wo.priority === 'CRITICAL' ? 'destructive' :
                    wo.priority === 'HIGH' ? 'outline' : 'secondary'
                  }>
                    {wo.priority === 'CRITICAL' ? 'Crítica' :
                     wo.priority === 'HIGH' ? 'Alta' :
                     wo.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {recentWO.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Nenhuma OS encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderEquipmentTable() {
    const recentEquip = equipment.slice(0, 5);
    return (
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentEquip.map(eq => (
              <TableRow key={eq.id}>
                <TableCell className="font-medium">{eq.tag}</TableCell>
                <TableCell>{eq.type}</TableCell>
                <TableCell>
                  <Badge variant={
                    eq.status === 'FUNCTIONING' ? 'default' :
                    eq.status === 'MAINTENANCE' ? 'secondary' : 'destructive'
                  }>
                    {eq.status === 'FUNCTIONING' ? 'Funcionando' :
                     eq.status === 'MAINTENANCE' ? 'Manutenção' : 'Parado'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {recentEquip.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Nenhum equipamento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  function renderWorkOrdersSummary() {
    const stats = {
      open: workOrderStats?.open ?? workOrders.filter(wo => wo.status === 'OPEN').length,
      inProgress: workOrderStats?.in_progress ?? workOrders.filter(wo => wo.status === 'IN_PROGRESS').length,
      completed: workOrderStats?.completed ?? workOrders.filter(wo => wo.status === 'COMPLETED').length,
    };

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-primary" />
          <span className="font-medium">Resumo de OS</span>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.open}</div>
            <div className="text-xs text-yellow-600">Abertas</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
            <div className="text-xs text-blue-600">Em Andamento</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-xs text-green-600">Concluídas</div>
          </div>
        </div>
      </div>
    );
  }

  function renderEquipmentStatus() {
    const stats = {
      functioning: equipment.filter(eq => eq.status === 'FUNCTIONING').length,
      maintenance: equipment.filter(eq => eq.status === 'MAINTENANCE').length,
      stopped: equipment.filter(eq => eq.status === 'STOPPED').length,
    };
    const total = stats.functioning + stats.maintenance + stats.stopped;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-primary" />
          <span className="font-medium">Status dos Equipamentos</span>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Funcionando</span>
            </div>
            <span className="font-medium">{stats.functioning}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Em Manutenção</span>
            </div>
            <span className="font-medium">{stats.maintenance}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">Parado</span>
            </div>
            <span className="font-medium">{stats.stopped}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="font-bold">{total}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderMaintenanceSchedule() {
    const upcomingWO = workOrders
      .filter(wo => wo.status === 'OPEN' || wo.status === 'IN_PROGRESS')
      .slice(0, 4);

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-medium">Próximas Manutenções</span>
        </div>
        <div className="flex-1 space-y-2 overflow-auto">
          {upcomingWO.map(wo => (
            <div key={wo.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{wo.number}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(wo.scheduledDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {wo.priority === 'CRITICAL' ? 'Crítica' :
                 wo.priority === 'HIGH' ? 'Alta' : 'Normal'}
              </Badge>
            </div>
          ))}
          {upcomingWO.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Nenhuma manutenção agendada
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderTechnicianPerformance() {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-medium">Performance dos Técnicos</span>
        </div>
        <div className="flex-1 space-y-3">
          {['João Silva', 'Maria Santos', 'Pedro Costa'].map((name, i) => {
            const percent = [85, 72, 91][i];
            return (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="font-medium">{percent}%</span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSLAOverview() {
    const onTime = 87;
    const breached = 13;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-medium">Visão Geral SLA</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-green-600">{onTime}%</div>
          <div className="text-sm text-muted-foreground">Dentro do SLA</div>
          <div className="mt-4 w-full">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${onTime}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-green-600">No prazo: {onTime}%</span>
              <span className="text-red-600">Atrasado: {breached}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderTextDisplay() {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-center text-muted-foreground">
          {widget.config?.text || 'Clique em configurar para adicionar texto'}
        </p>
      </div>
    );
  }

  function renderPhotoDisplay() {
    const imageUrl = widget.config?.imageUrl;
    return (
      <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
        {imageUrl ? (
          <img src={imageUrl} alt="Widget" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-center text-muted-foreground">
            <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Clique em configurar para adicionar imagem</p>
          </div>
        )}
      </div>
    );
  }

  function renderPlaceholder() {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <Activity className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm">Widget: {widget.type}</p>
        <p className="text-xs">Configure para visualizar dados</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          getSizeClasses(widget.size),
          isDragging && 'opacity-50 z-50'
        )}
      >
        <Card className={cn(
          "h-full transition-all",
          editMode && "ring-2 ring-dashed ring-primary/30 hover:ring-primary/50"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 py-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {editMode && (
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              {widget.title}
              {/* Legenda das variáveis para gráficos */}
              {(widget.type === 'chart-line-echarts' || widget.type === 'chart-area') && multiSensorHistory.series.length > 0 && (
                <div className="flex items-center gap-2 ml-3">
                  {multiSensorHistory.series.map((serie) => (
                    <button
                      key={serie.label}
                      onClick={() => {
                        const newHidden = new Set(hiddenSeries);
                        if (newHidden.has(serie.label)) {
                          newHidden.delete(serie.label);
                        } else {
                          newHidden.add(serie.label);
                        }
                        setHiddenSeries(newHidden);
                      }}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-all",
                        hiddenSeries.has(serie.label) 
                          ? "opacity-40 line-through" 
                          : "opacity-100"
                      )}
                      style={{ 
                        borderLeft: `3px solid ${serie.color}`,
                        paddingLeft: '6px'
                      }}
                    >
                      {serie.label}
                    </button>
                  ))}
                </div>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Filtro de tempo para gráficos ECharts */}
              {(widget.type === 'chart-line-echarts' || widget.type === 'chart-area') && widget.config?.sensorTags && (
                <div className="flex gap-0.5">
                  {[{ value: '1h', label: '1h' }, { value: '12h', label: '12h' }, { value: '24h', label: '24h' }, { value: '7d', label: '7d' }, { value: '30d', label: '30d' }].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setChartPeriod(opt.value)}
                      className={cn(
                        "px-2 py-0.5 text-xs rounded transition-colors",
                        chartPeriod === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              {editMode && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleConfig}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={handleRemove}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-2 h-[calc(100%-3rem)]">
            <div className="h-full">
              {renderWidgetContent()}
            </div>
          </CardContent>
        </Card>
      </div>

      <WidgetConfig
        widget={widget}
        layoutId={layoutId}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Remover Widget"
        description={`Tem certeza que deseja remover o widget "${widget.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
