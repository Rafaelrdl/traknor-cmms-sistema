import { useState, useEffect, useMemo } from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useAssetsQuery, useAssetSensorsQuery } from '@/apps/monitor/hooks/useAssetsQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { Settings, Save, X, Zap, Code, Loader2 } from 'lucide-react';
import type { AssetSensor } from '@/apps/monitor/types/asset';

// Exemplos de fórmulas para transformação de valores
const FORMULA_EXAMPLES = [
  { label: 'Converter para Fahrenheit', formula: '($VALUE$ * 9/5) + 32', description: 'Converte °C para °F' },
  { label: 'Arredondar', formula: 'Math.round($VALUE$)', description: 'Remove casas decimais' },
  { label: 'Valor absoluto', formula: 'Math.abs($VALUE$)', description: 'Remove sinal negativo' },
  { label: 'Limitar range', formula: 'Math.min(Math.max($VALUE$, 0), 100)', description: 'Limita entre 0 e 100' },
  { label: 'Boolean para texto', formula: '$VALUE$ == true ? "Ligado" : "Desligado"', description: 'Converte boolean' },
  { label: 'Porcentagem', formula: '($VALUE$ / 100) * 100', description: 'Formata como porcentagem' },
];

interface WidgetConfigProps {
  widget: DashboardWidget;
  layoutId: string;
  open: boolean;
  onClose: () => void;
}

// Interface para agrupar sensores por device
interface DeviceGroup {
  deviceId: number;
  displayName: string;
  fullSerial: string;
  sensors: AssetSensor[];
}

export function WidgetConfig({ widget, layoutId, open, onClose }: WidgetConfigProps) {
  const updateWidget = useDashboardStore(state => state.updateWidget);
  
  // Estados locais para edição
  const [title, setTitle] = useState(widget.title);
  const [size, setSize] = useState(widget.size);
  const [config, setConfig] = useState(widget.config || {});

  // Estados para seleção de fonte de dados
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(
    config.assetId ? parseInt(config.assetId.toString()) : null
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(
    config.deviceId ? parseInt(config.deviceId.toString()) : null
  );
  const [selectedSensorTag, setSelectedSensorTag] = useState<string | null>(
    config.sensorTag || null
  );

  // Verificar se é widget de múltiplas variáveis (gráficos)
  const isMultiVariableChart = [
    'chart-line', 'chart-area', 'chart-bar', 'chart-bar-horizontal', 
    'chart-pie', 'chart-donut', 'table-data'
  ].includes(widget.type);

  const [selectedVariables, setSelectedVariables] = useState<string[]>(
    config.sensorTags || (config.sensorTag ? [config.sensorTag] : [])
  );

  // React Query: buscar assets
  const { data: assets = [], isLoading: isLoadingAssets } = useAssetsQuery({});

  // React Query: buscar sensores do asset selecionado
  const { 
    data: assetSensors = [], 
    isLoading: isLoadingSensors 
  } = useAssetSensorsQuery(selectedAssetId);

  // Agrupar sensores por device
  const deviceGroups = useMemo<DeviceGroup[]>(() => {
    const map = new Map<number, DeviceGroup>();
    
    assetSensors.forEach(sensor => {
      // Usar device como ID (campo numérico que referencia o device)
      const deviceId = (sensor as any).device || 0;
      
      if (!map.has(deviceId)) {
        // Extrair nome do device do sensor
        const displayName = (sensor as any).device_display_name || 
                           (sensor as any).device_name ||
                           `Device ${deviceId}`;
        const fullSerial = (sensor as any).device_serial || '';
        
        map.set(deviceId, {
          deviceId,
          displayName,
          fullSerial,
          sensors: []
        });
      }
      
      map.get(deviceId)!.sensors.push(sensor);
    });
    
    return Array.from(map.values());
  }, [assetSensors]);

  // Sensores do device selecionado
  const availableSensors = useMemo(() => {
    if (!selectedDeviceId) return [];
    const group = deviceGroups.find(g => g.deviceId === selectedDeviceId);
    return group?.sensors || [];
  }, [deviceGroups, selectedDeviceId]);

  // Sensor selecionado
  const selectedSensor = useMemo(() => {
    if (!selectedSensorTag) return null;
    return availableSensors.find(s => s.tag === selectedSensorTag) || null;
  }, [availableSensors, selectedSensorTag]);

  // Resetar estados quando o widget mudar
  useEffect(() => {
    setTitle(widget.title);
    setSize(widget.size);
    setConfig(widget.config || {});
    setSelectedAssetId(widget.config?.assetId ? parseInt(widget.config.assetId.toString()) : null);
    setSelectedDeviceId(widget.config?.deviceId ? parseInt(widget.config.deviceId.toString()) : null);
    setSelectedSensorTag(widget.config?.sensorTag || null);
    setSelectedVariables(widget.config?.sensorTags || (widget.config?.sensorTag ? [widget.config.sensorTag] : []));
  }, [widget]);

  // Atualizar config quando seleções mudarem
  useEffect(() => {
    if (!selectedAssetId) return;
    
    const selectedAsset = assets.find(a => a.id === selectedAssetId);
    const deviceGroup = deviceGroups.find(g => g.deviceId === selectedDeviceId);
    
    if (isMultiVariableChart && selectedVariables.length > 0) {
      const selectedSensors = availableSensors.filter(s => selectedVariables.includes(s.tag));
      
      setConfig(prev => ({
        ...prev,
        assetId: selectedAssetId?.toString(),
        assetTag: selectedAsset?.tag,
        deviceId: selectedDeviceId?.toString(),
        deviceName: deviceGroup?.displayName,
        sensorTags: selectedVariables,
        sensorTag: selectedVariables[0],
        unit: selectedSensors[0]?.unit,
      }));
    } else if (selectedSensor) {
      setConfig(prev => ({
        ...prev,
        assetId: selectedAssetId?.toString(),
        assetTag: selectedAsset?.tag,
        deviceId: selectedDeviceId?.toString(),
        deviceName: deviceGroup?.displayName,
        sensorTag: selectedSensor.tag,
        unit: selectedSensor.unit,
      }));
    }
  }, [isMultiVariableChart, selectedVariables, selectedSensor, selectedAssetId, selectedDeviceId, assets, deviceGroups, availableSensors]);

  const handleSave = () => {
    updateWidget(layoutId, widget.id, {
      title,
      size,
      config,
    });
    onClose();
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Verificar se deve mostrar fonte de dados
  const showDataSource = !['table-alerts', 'photo-display', 'text-display', 
    'table-workorders', 'table-equipments', 'wo-by-status', 'wo-by-priority',
    'wo-by-type', 'os-abertas', 'os-andamento', 'os-atrasadas', 'mttr',
    'mtbf', 'disponibilidade', 'backlog'
  ].includes(widget.type);

  // Verificar se deve mostrar limites
  const showLimits = !['table-data', 'table-alerts', 'photo-display', 'text-display',
    'table-workorders', 'table-equipments'
  ].includes(widget.type) && showDataSource;

  // Helper para extrair o nome da variável do tag (remove prefixo MAC se existir)
  // Ex: "F80332010002C873_temperatura_ambiente" -> "temperatura_ambiente"
  const getVariableName = (tag: string) => {
    // Verifica se o tag tem o padrão MAC_nome (16 chars hex + underscore + nome)
    const macPattern = /^[A-Fa-f0-9]{16}_(.+)$/;
    const match = tag.match(macPattern);
    if (match) {
      return match[1]; // Retorna apenas o nome após o MAC
    }
    return tag; // Retorna o tag original se não tiver prefixo MAC
  };

  // Helper para formatar nome do sensor - usa o tag como identificador principal
  const formatSensorName = (sensor: AssetSensor) => {
    // Retorna o tag do sensor sem o prefixo MAC
    return getVariableName(sensor.tag || sensor.name || sensor.metric_type);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 py-5 border-b bg-background">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            Configurar Widget
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Configure o widget e vincule um sensor para exibir dados em tempo real
          </p>
        </DialogHeader>

        {/* Content com scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                Informações Básicas
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="widget-title" className="text-sm font-medium">Título do Widget</Label>
                <Input
                  id="widget-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Temperatura Sala 01"
                  className="h-10"
                />
              </div>
            </div>

            {/* Fonte de Dados */}
            {showDataSource && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                  <div className="p-1.5 bg-yellow-500 text-white rounded-md">
                    <Zap className="w-4 h-4" />
                  </div>
                  Fonte de Dados
                </h3>

                {/* Passo 1: Selecionar Equipamento */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    1️⃣ Equipamento
                  </Label>
                  {isLoadingAssets ? (
                    <div className="flex items-center justify-center h-10 border rounded-md bg-muted/50">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Carregando equipamentos...</span>
                    </div>
                  ) : (
                    <Select
                      value={selectedAssetId?.toString() || ''}
                      onValueChange={(value) => {
                        const assetId = parseInt(value);
                        setSelectedAssetId(assetId);
                        setSelectedDeviceId(null);
                        setSelectedSensorTag(null);
                        setSelectedVariables([]);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione um equipamento" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {assets.length === 0 ? (
                          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                            Nenhum equipamento disponível
                          </div>
                        ) : (
                          assets.map(asset => (
                            <SelectItem key={asset.id} value={asset.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{asset.tag}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground text-sm">{asset.asset_type || asset.type}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-primary text-sm">{asset.full_location || asset.site_name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Passo 2: Selecionar Device/Sensor */}
                {selectedAssetId && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      2️⃣ Sensor (Device)
                    </Label>
                    {isLoadingSensors ? (
                      <div className="flex items-center justify-center h-10 border rounded-md bg-muted/50">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Carregando sensores...</span>
                      </div>
                    ) : deviceGroups.length > 0 ? (
                      <Select
                        value={selectedDeviceId?.toString() || ''}
                        onValueChange={(value) => {
                          setSelectedDeviceId(parseInt(value));
                          setSelectedSensorTag(null);
                          setSelectedVariables([]);
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione um sensor" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {deviceGroups.map(device => (
                            <SelectItem 
                              key={device.deviceId} 
                              value={device.deviceId.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-foreground">
                                  {device.displayName}
                                </span>
                                {device.fullSerial && (
                                  <span className="text-muted-foreground text-xs">
                                    ({device.fullSerial})
                                  </span>
                                )}
                                <span className="text-muted-foreground text-xs">
                                  - {device.sensors.length} variáveis
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center justify-center h-10 border rounded-md bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                        <span className="text-sm text-orange-700 dark:text-orange-400">
                          Nenhum sensor encontrado para este equipamento
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Passo 3: Selecionar Variável(is) */}
                {selectedDeviceId && availableSensors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      3️⃣ Variável{isMultiVariableChart ? 's' : ''} {isMultiVariableChart && '(múltipla seleção)'}
                    </Label>
                    
                    {isMultiVariableChart ? (
                      <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {availableSensors.map((sensor, index) => {
                          const isSelected = selectedVariables.includes(sensor.tag);
                          
                          return (
                            <label
                              key={`${sensor.tag}-${index}`}
                              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-primary/10 border border-primary' 
                                  : 'hover:bg-muted border border-transparent'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedVariables(prev => [...prev, sensor.tag]);
                                  } else {
                                    setSelectedVariables(prev => prev.filter(t => t !== sensor.tag));
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="font-mono font-medium text-foreground">{getVariableName(sensor.tag)}</span>
                                {sensor.is_online ? (
                                  <span className="text-xs text-green-600">🟢</span>
                                ) : (
                                  <span className="text-xs text-red-600">🔴</span>
                                )}
                                {sensor.last_value !== null && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground text-sm">
                                      {sensor.last_value.toFixed(2)} {sensor.unit}
                                    </span>
                                  </>
                                )}
                              </div>
                            </label>
                          );
                        })}
                        {selectedVariables.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              {selectedVariables.length} variável(is) selecionada(s)
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Select
                        value={selectedSensorTag || ''}
                        onValueChange={(value) => setSelectedSensorTag(value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione uma variável" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {availableSensors.map((sensor, index) => (
                            <SelectItem key={`${sensor.tag}-${index}`} value={sensor.tag}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-foreground">{getVariableName(sensor.tag)}</span>
                                {sensor.is_online ? (
                                  <span className="text-xs">🟢</span>
                                ) : (
                                  <span className="text-xs">🔴</span>
                                )}
                                {sensor.last_value !== null && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground text-sm">
                                      {sensor.last_value.toFixed(2)} {sensor.unit}
                                    </span>
                                  </>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Fórmula de Transformação */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">
                      Fórmula de Transformação (opcional)
                    </Label>
                  </div>
                  
                  <Textarea
                    value={config.transform?.formula || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      transform: { 
                        ...config.transform,
                        formula: e.target.value 
                      }
                    })}
                    placeholder={'Use $VALUE$ para referenciar o valor do sensor\n\nExemplo: $VALUE$ == true ? "Ligado" : "Desligado"'}
                    className="font-mono text-sm min-h-[80px] resize-y"
                    rows={3}
                  />
                  
                  <p className="text-xs text-muted-foreground">
                    Transforme o valor do sensor usando expressões JavaScript. Use <code className="text-xs bg-muted px-1 py-0.5 rounded">$VALUE$</code> como placeholder.
                  </p>
                  
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium text-foreground hover:text-accent-foreground transition-colors">
                      📚 Ver exemplos e operadores disponíveis
                    </summary>
                    
                    <div className="mt-3 space-y-3 pl-3 border-l-2 border-muted">
                      <div>
                        <p className="font-semibold text-foreground mb-2">Exemplos:</p>
                        <div className="space-y-2">
                          {FORMULA_EXAMPLES.map((example, idx) => (
                            <div key={idx} className="p-2 bg-muted/50 rounded border">
                              <p className="font-medium text-foreground">{example.label}</p>
                              <code className="text-xs text-accent-foreground block mt-1 break-all">
                                {example.formula}
                              </code>
                              <p className="text-muted-foreground mt-1">{example.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-foreground mb-2">Operadores suportados:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">+, -, *, /, %</code> - Aritméticos</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">==, !=, &lt;, &gt;, &lt;=, &gt;=</code> - Comparação</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">&amp;&amp;, ||, !</code> - Lógicos</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">cond ? a : b</code> - Ternário</li>
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Label, Unidade, Casas Decimais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Label (opcional)</Label>
                    <Input
                      value={config.label || ''}
                      onChange={(e) => handleConfigChange('label', e.target.value)}
                      placeholder="Ex: Temperatura"
                      className="h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Unidade</Label>
                    <Input
                      value={config.unit || selectedSensor?.unit || ''}
                      onChange={(e) => handleConfigChange('unit', e.target.value)}
                      placeholder="Ex: °C, kW, %"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Casas Decimais</Label>
                    <Select
                      value={config.decimals?.toString() || '2'}
                      onValueChange={(value) => handleConfigChange('decimals', parseInt(value))}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0️⃣ 0 casas (100)</SelectItem>
                        <SelectItem value="1">1️⃣ 1 casa (100.0)</SelectItem>
                        <SelectItem value="2">2️⃣ 2 casas (100.00)</SelectItem>
                        <SelectItem value="3">3️⃣ 3 casas (100.000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Aparência */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                Aparência
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium whitespace-nowrap">
                    Cor do Widget:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={config.color || '#3b82f6'}
                      onChange={(e) => handleConfigChange('color', e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <span className="text-sm font-mono text-muted-foreground">
                      {config.color || '#3b82f6'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Limites e Alertas */}
            {showLimits && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                  <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                  Limites e Alertas
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <span className="text-yellow-600 text-lg">⚠️</span>
                      Limite de Aviso
                    </Label>
                    <Input
                      type="number"
                      value={config.warningThreshold || ''}
                      onChange={(e) => handleConfigChange('warningThreshold', parseFloat(e.target.value) || undefined)}
                      placeholder="80"
                      className="h-10 border-yellow-300 focus:border-yellow-500"
                    />
                    <p className="text-xs text-muted-foreground">
                      Widget ficará amarelo ao atingir este valor
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <span className="text-red-600 text-lg">🚨</span>
                      Limite Crítico
                    </Label>
                    <Input
                      type="number"
                      value={config.criticalThreshold || ''}
                      onChange={(e) => handleConfigChange('criticalThreshold', parseFloat(e.target.value) || undefined)}
                      placeholder="90"
                      className="h-10 border-red-300 focus:border-red-500"
                    />
                    <p className="text-xs text-muted-foreground">
                      Widget ficará vermelho ao atingir este valor
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer com status e ações */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t px-6 py-4 bg-background">
          <div className="text-sm text-muted-foreground">
            {selectedSensor ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Configuração completa: <span className="font-medium">
                  {formatSensorName(selectedSensor)} ({selectedSensor.unit})
                </span>
              </span>
            ) : isMultiVariableChart && selectedVariables.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {selectedVariables.length} variável(is) selecionada(s)
              </span>
            ) : selectedDeviceId ? (
              <span className="text-primary flex items-center gap-2">
                📊 Device selecionado. Escolha uma ou mais variáveis.
              </span>
            ) : selectedAssetId ? (
              <span className="text-primary flex items-center gap-2">
                📍 Equipamento selecionado. Escolha um sensor.
              </span>
            ) : showDataSource ? (
              <span className="text-orange-600 flex items-center gap-2">
                ⚠️ Selecione um equipamento para começar
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Widget configurável
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto h-10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="w-full sm:w-auto h-10"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
