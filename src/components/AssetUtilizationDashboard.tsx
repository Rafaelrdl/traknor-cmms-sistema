import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle,
  Clock,
  Gauge,
  PieChart,
  Building2,
  MapPin,
  Users,
  Wrench,
  Target,
  Thermometer,
  Calendar
} from 'lucide-react';
import type { AssetUtilization, LocationCostAnalysis, Equipment } from '@/types';

interface AssetUtilizationDashboardProps {
  equipment: Equipment[];
  selectedLocation?: string;
  selectedPeriod?: string;
}

export function AssetUtilizationDashboard({ 
  equipment, 
  selectedLocation,
  selectedPeriod = '30d' 
}: AssetUtilizationDashboardProps) {
  const [activeTab, setActiveTab] = useState('utilization');
  const [selectedTimeframe, setSelectedTimeframe] = useState(selectedPeriod);

  // Mock data generation - in real app, this would come from API
  const utilizationData = useMemo<AssetUtilization[]>(() => {
    return equipment.map(eq => ({
      equipmentId: eq.id,
      avgOperatingHours: Math.floor(Math.random() * 12) + 8, // 8-20 hours per day
      utilizationRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      energyConsumption: Math.floor(Math.random() * 200) + 150, // 150-350 kWh
      maintenanceCosts: Math.floor(Math.random() * 500) + 200, // R$ 200-700
      downtimeHours: Math.floor(Math.random() * 24), // 0-24 hours
      efficiency: Math.floor(Math.random() * 20) + 80, // 80-100%
      lastUpdated: new Date().toISOString()
    }));
  }, [equipment]);

  const locationCostData = useMemo<LocationCostAnalysis[]>(() => {
    // Group equipment by location
    const locationGroups = equipment.reduce((acc, eq) => {
      const locationKey = eq.sectorId || eq.subSectionId || 'unknown';
      if (!acc[locationKey]) {
        acc[locationKey] = [];
      }
      acc[locationKey].push(eq);
      return acc;
    }, {} as Record<string, Equipment[]>);

    return Object.entries(locationGroups).map(([locationId, equipments]) => {
      const totalEquipment = equipments.length;
      const totalMaintenanceCosts = equipments.reduce((total, eq) => {
        const utilizationItem = utilizationData.find(u => u.equipmentId === eq.id);
        return total + (utilizationItem?.maintenanceCosts || 0);
      }, 0);

      const preventiveCosts = totalMaintenanceCosts * 0.6; // 60% preventive
      const correctiveCosts = totalMaintenanceCosts * 0.3; // 30% corrective  
      const emergencyCosts = totalMaintenanceCosts * 0.1; // 10% emergency
      const energyCosts = equipments.reduce((total, eq) => {
        const utilizationItem = utilizationData.find(u => u.equipmentId === eq.id);
        return total + (utilizationItem?.energyConsumption || 0) * 0.6; // R$ 0.60 per kWh
      }, 0);

      const totalDowntimeHours = equipments.reduce((total, eq) => {
        const utilizationItem = utilizationData.find(u => u.equipmentId === eq.id);
        return total + (utilizationItem?.downtimeHours || 0);
      }, 0);

      // Generate mock cost trends
      const costTrends = Array.from({ length: 12 }, (_, i) => ({
        period: new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        cost: Math.floor(Math.random() * totalMaintenanceCosts * 0.3) + totalMaintenanceCosts * 0.7
      }));

      return {
        locationId,
        locationName: `Setor ${locationId}`,
        locationType: 'sector' as const,
        totalEquipment,
        totalMaintenanceCosts: Math.round(totalMaintenanceCosts),
        avgCostPerEquipment: Math.round(totalMaintenanceCosts / totalEquipment),
        preventiveCosts: Math.round(preventiveCosts),
        correctiveCosts: Math.round(correctiveCosts),
        emergencyCosts: Math.round(emergencyCosts),
        energyCosts: Math.round(energyCosts),
        totalDowntimeHours,
        costTrends
      };
    });
  }, [equipment, utilizationData]);

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const avgUtilization = utilizationData.reduce((sum, item) => sum + item.utilizationRate, 0) / utilizationData.length;
    const totalEnergyCost = utilizationData.reduce((sum, item) => sum + item.energyConsumption * 0.6, 0);
    const totalMaintenanceCost = utilizationData.reduce((sum, item) => sum + item.maintenanceCosts, 0);
    const totalDowntime = utilizationData.reduce((sum, item) => sum + item.downtimeHours, 0);
    const avgEfficiency = utilizationData.reduce((sum, item) => sum + item.efficiency, 0) / utilizationData.length;

    return {
      avgUtilization: Math.round(avgUtilization * 10) / 10,
      totalEnergyCost: Math.round(totalEnergyCost),
      totalMaintenanceCost: Math.round(totalMaintenanceCost),
      totalDowntime,
      avgEfficiency: Math.round(avgEfficiency * 10) / 10,
      totalOperatingCost: Math.round(totalEnergyCost + totalMaintenanceCost)
    };
  }, [utilizationData]);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 85) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCostTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Análise de Utilização de Ativos</h2>
          <p className="text-muted-foreground">
            Métricas de desempenho e análise de custos por local
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilização Média</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgUtilization}%</div>
            <Progress value={overallMetrics.avgUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgEfficiency}%</div>
            <Progress value={overallMetrics.avgEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Operacional</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {overallMetrics.totalOperatingCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Energia + Manutenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Parada</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalDowntime}h</div>
            <p className="text-xs text-muted-foreground mt-1">Total no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Equipamentos monitorados</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="utilization">Utilização de Ativos</TabsTrigger>
          <TabsTrigger value="costs">Análise de Custos</TabsTrigger>
          <TabsTrigger value="locations">Por Localização</TabsTrigger>
        </TabsList>

        <TabsContent value="utilization" className="space-y-6">
          {/* Equipment Utilization Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Utilização por Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Utilização</TableHead>
                    <TableHead>Eficiência</TableHead>
                    <TableHead>Horas Op./Dia</TableHead>
                    <TableHead>Consumo Energético</TableHead>
                    <TableHead>Tempo Parado</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map(eq => {
                    const utilization = utilizationData.find(u => u.equipmentId === eq.id);
                    if (!utilization) return null;

                    return (
                      <TableRow key={eq.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{eq.tag}</div>
                            <div className="text-sm text-muted-foreground">
                              {eq.brand} {eq.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-medium ${getUtilizationColor(utilization.utilizationRate)}`}>
                              {utilization.utilizationRate}%
                            </div>
                            <Progress 
                              value={utilization.utilizationRate} 
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-medium ${getEfficiencyColor(utilization.efficiency)}`}>
                              {utilization.efficiency}%
                            </div>
                            <Progress 
                              value={utilization.efficiency} 
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{utilization.avgOperatingHours}h</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span>{utilization.energyConsumption} kWh</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <span>{utilization.downtimeHours}h</span>
                          </div>
                        </TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Performance Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Distribuição de Eficiência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: '90-100%', count: utilizationData.filter(u => u.efficiency >= 90).length, color: 'bg-green-500' },
                    { range: '80-89%', count: utilizationData.filter(u => u.efficiency >= 80 && u.efficiency < 90).length, color: 'bg-yellow-500' },
                    { range: '70-79%', count: utilizationData.filter(u => u.efficiency >= 70 && u.efficiency < 80).length, color: 'bg-orange-500' },
                    { range: '< 70%', count: utilizationData.filter(u => u.efficiency < 70).length, color: 'bg-red-500' }
                  ].map(item => (
                    <div key={item.range} className="flex items-center gap-4">
                      <div className="w-20 text-sm">{item.range}</div>
                      <div className="flex-1 bg-muted rounded-full h-4 relative">
                        <div 
                          className={`h-4 rounded-full ${item.color} transition-all duration-300`}
                          style={{ width: `${(item.count / equipment.length) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-right">{item.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Distribuição de Utilização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: '85-100%', count: utilizationData.filter(u => u.utilizationRate >= 85).length, color: 'bg-green-500' },
                    { range: '70-84%', count: utilizationData.filter(u => u.utilizationRate >= 70 && u.utilizationRate < 85).length, color: 'bg-yellow-500' },
                    { range: '50-69%', count: utilizationData.filter(u => u.utilizationRate >= 50 && u.utilizationRate < 70).length, color: 'bg-orange-500' },
                    { range: '< 50%', count: utilizationData.filter(u => u.utilizationRate < 50).length, color: 'bg-red-500' }
                  ].map(item => (
                    <div key={item.range} className="flex items-center gap-4">
                      <div className="w-20 text-sm">{item.range}</div>
                      <div className="flex-1 bg-muted rounded-full h-4 relative">
                        <div 
                          className={`h-4 rounded-full ${item.color} transition-all duration-300`}
                          style={{ width: `${(item.count / equipment.length) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-right">{item.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          {/* Cost Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      label: 'Energia', 
                      value: overallMetrics.totalEnergyCost, 
                      color: 'bg-blue-500',
                      percentage: (overallMetrics.totalEnergyCost / overallMetrics.totalOperatingCost) * 100
                    },
                    { 
                      label: 'Manutenção Preventiva', 
                      value: Math.round(overallMetrics.totalMaintenanceCost * 0.6), 
                      color: 'bg-green-500',
                      percentage: (overallMetrics.totalMaintenanceCost * 0.6 / overallMetrics.totalOperatingCost) * 100
                    },
                    { 
                      label: 'Manutenção Corretiva', 
                      value: Math.round(overallMetrics.totalMaintenanceCost * 0.3), 
                      color: 'bg-yellow-500',
                      percentage: (overallMetrics.totalMaintenanceCost * 0.3 / overallMetrics.totalOperatingCost) * 100
                    },
                    { 
                      label: 'Emergencial', 
                      value: Math.round(overallMetrics.totalMaintenanceCost * 0.1), 
                      color: 'bg-red-500',
                      percentage: (overallMetrics.totalMaintenanceCost * 0.1 / overallMetrics.totalOperatingCost) * 100
                    }
                  ].map(item => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${item.color}`} />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium">
                          R$ {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Custo por Equipamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      R$ {Math.round(overallMetrics.totalOperatingCost / equipment.length).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Custo médio por equipamento</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">
                        R$ {Math.round(overallMetrics.totalEnergyCost / equipment.length).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Energia</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        R$ {Math.round(overallMetrics.totalMaintenanceCost / equipment.length).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Manutenção</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Cost Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Ranking de Custos por Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Energia (R$)</TableHead>
                    <TableHead>Manutenção (R$)</TableHead>
                    <TableHead>Total (R$)</TableHead>
                    <TableHead>Custo/BTU</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment
                    .map(eq => {
                      const utilization = utilizationData.find(u => u.equipmentId === eq.id);
                      const energyCost = (utilization?.energyConsumption || 0) * 0.6;
                      const maintenanceCost = utilization?.maintenanceCosts || 0;
                      const totalCost = energyCost + maintenanceCost;
                      const costPerBTU = totalCost / eq.capacity;
                      
                      return {
                        ...eq,
                        energyCost,
                        maintenanceCost,
                        totalCost,
                        costPerBTU
                      };
                    })
                    .sort((a, b) => b.totalCost - a.totalCost)
                    .slice(0, 10)
                    .map(eq => (
                      <TableRow key={eq.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{eq.tag}</div>
                            <div className="text-sm text-muted-foreground">
                              {eq.brand} {eq.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>R$ {Math.round(eq.energyCost).toLocaleString()}</TableCell>
                        <TableCell>R$ {Math.round(eq.maintenanceCost).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">
                          R$ {Math.round(eq.totalCost).toLocaleString()}
                        </TableCell>
                        <TableCell>R$ {eq.costPerBTU.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          {/* Location Cost Analysis */}
          <div className="grid gap-6">
            {locationCostData.map(location => (
              <Card key={location.locationId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {location.locationName}
                    </div>
                    <Badge variant="outline">
                      {location.totalEquipment} equipamentos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cost Summary */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        R$ {location.totalMaintenanceCosts.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Custo Total</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {location.avgCostPerEquipment.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Custo Médio</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        R$ {location.energyCosts.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Energia</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {location.totalDowntimeHours}h
                      </div>
                      <p className="text-sm text-muted-foreground">Downtime</p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Distribuição de Custos de Manutenção</h4>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Preventiva:</span>
                        <span className="font-medium">R$ {location.preventiveCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Corretiva:</span>
                        <span className="font-medium">R$ {location.correctiveCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Emergencial:</span>
                        <span className="font-medium">R$ {location.emergencyCosts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Trend Chart (simplified) */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Tendência de Custos (12 meses)</h4>
                    <div className="flex items-end gap-1 h-20">
                      {location.costTrends.slice(-6).map((trend, index) => {
                        const height = (trend.cost / Math.max(...location.costTrends.map(t => t.cost))) * 80;
                        const prevCost = index > 0 ? location.costTrends[index - 1].cost : trend.cost;
                        
                        return (
                          <div key={trend.period} className="flex flex-col items-center gap-1 flex-1">
                            <div className="flex items-center gap-1">
                              {getCostTrendIcon(trend.cost, prevCost)}
                            </div>
                            <div 
                              className="bg-blue-500 w-full rounded-t transition-all duration-300 hover:bg-blue-600"
                              style={{ height: `${height}px` }}
                              title={`${trend.period}: R$ ${trend.cost.toFixed(0)}`}
                            />
                            <span className="text-xs text-muted-foreground rotate-45 origin-left">
                              {trend.period}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {locationCostData.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhuma análise de local disponível</h3>
                <p className="text-muted-foreground">
                  Adicione equipamentos com localizações definidas para visualizar análises por local.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}