import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactECharts from 'echarts-for-react';
import { Users } from 'lucide-react';
import { useChartData } from '@/hooks/useDataTemp';
import type { TechnicianPerformance } from '@/types';

export function TechnicianPerformanceChart() {
  const [chartData] = useChartData();
  const technicianData = chartData?.technicianPerformance || [];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        let result = `<strong>${params[0].name}</strong><br/>`;
        let total = 0;
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
          total += param.value;
        });
        result += `<strong>Total: ${total}</strong>`;
        return result;
      }
    },
    legend: {
      data: ['Preventiva', 'Corretiva', 'Solicitação'],
      bottom: 0,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: technicianData.map(item => item.name),
      axisLabel: {
        fontSize: 11
      }
    },
    series: [
      {
        name: 'Preventiva',
        type: 'bar',
        stack: 'total',
        color: '#00968f',
        data: technicianData.map(item => item.preventive),
        barCategoryGap: '60%'
      },
      {
        name: 'Corretiva',
        type: 'bar',
        stack: 'total',
        color: '#ffbe0b',
        data: technicianData.map(item => item.corrective)
      },
      {
        name: 'Solicitação',
        type: 'bar',
        stack: 'total',
        color: '#715aff',
        data: technicianData.map(item => item.request)
      }
    ]
  };

  // Generate aria-label for accessibility
  const totalWorkOrders = technicianData.reduce((sum, tech) => 
    sum + tech.preventive + tech.corrective + tech.request, 0
  );
  
  const ariaLabel = `Gráfico de desempenho dos técnicos. Total de ${totalWorkOrders} ordens de serviço. 
    ${technicianData.map(tech => 
      `${tech.name}: ${tech.preventive + tech.corrective + tech.request} ordens`
    ).join(', ')}.`;

  if (technicianData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Desempenho por Técnico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de desempenho disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Desempenho por Técnico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          role="img" 
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={(e) => {
            // Allow keyboard navigation for accessibility
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              // Focus management could be enhanced here for full accessibility
            }
          }}
        >
          <ReactECharts 
            option={option} 
            style={{ height: '300px' }} 
            opts={{ renderer: 'canvas' }}
            lazyUpdate={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}