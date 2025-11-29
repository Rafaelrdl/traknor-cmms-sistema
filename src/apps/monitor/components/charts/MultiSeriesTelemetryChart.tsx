/**
 * MultiSeriesTelemetryChart - Gráfico de séries temporais
 * 
 * Exibe múltiplas séries de dados de telemetria.
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TelemetrySeries {
  sensorId: string;
  sensorName?: string;
  metricType?: string;
  unit?: string;
  data: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface MultiSeriesTelemetryChartProps {
  data: TelemetrySeries[];
}

// Cores para diferentes séries
const COLORS = [
  '#0088FE', // Azul
  '#00C49F', // Verde
  '#FFBB28', // Amarelo
  '#FF8042', // Laranja
  '#8884D8', // Roxo
  '#82CA9D', // Verde claro
  '#FF6B6B', // Vermelho
  '#4ECDC4', // Turquesa
];

export function MultiSeriesTelemetryChart({ data }: MultiSeriesTelemetryChartProps) {
  // Unificar dados de todas as séries em um único array de pontos
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Coletar todos os timestamps únicos
    const allTimestamps = new Set<string>();
    data.forEach(series => {
      series.data.forEach(point => {
        allTimestamps.add(point.timestamp);
      });
    });

    // Ordenar timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort();

    // Criar objetos com todos os valores
    return sortedTimestamps.map(timestamp => {
      const point: Record<string, any> = { timestamp };
      data.forEach(series => {
        const dataPoint = series.data.find(d => d.timestamp === timestamp);
        point[series.sensorId] = dataPoint?.value ?? null;
      });
      return point;
    });
  }, [data]);

  // Formatador de hora para o eixo X
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Formatador para tooltip
  const formatTooltipLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Nenhum dado para exibir
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <Tooltip
            labelFormatter={formatTooltipLabel}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {data.map((series, index) => (
            <Line
              key={series.sensorId}
              type="monotone"
              dataKey={series.sensorId}
              name={series.sensorName || series.sensorId}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
