import { useState, useEffect } from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { useDashboardStore } from '@/store/useDashboardStore';
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
  DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Palette, Database, Save } from 'lucide-react';

interface WidgetConfigProps {
  widget: DashboardWidget;
  layoutId: string;
  open: boolean;
  onClose: () => void;
}

export function WidgetConfig({ widget, layoutId, open, onClose }: WidgetConfigProps) {
  const updateWidget = useDashboardStore(state => state.updateWidget);
  
  // Estados locais para edição
  const [title, setTitle] = useState(widget.title);
  const [size, setSize] = useState(widget.size);
  const [config, setConfig] = useState(widget.config || {});

  // Resetar estados quando o widget mudar
  useEffect(() => {
    setTitle(widget.title);
    setSize(widget.size);
    setConfig(widget.config || {});
  }, [widget]);

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

  // Renderizar campos específicos por tipo de widget
  const renderTypeSpecificConfig = () => {
    switch (widget.type) {
      case 'card-kpi':
      case 'card-value':
      case 'card-stat':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rótulo</Label>
              <Input
                value={config.label || ''}
                onChange={(e) => handleConfigChange('label', e.target.value)}
                placeholder="Ex: OS em Aberto"
              />
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input
                value={config.unit || ''}
                onChange={(e) => handleConfigChange('unit', e.target.value)}
                placeholder="Ex: %, h, un"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (estático)</Label>
              <Input
                type="number"
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                placeholder="Deixe vazio para dados dinâmicos"
              />
            </div>
          </div>
        );

      case 'card-progress':
      case 'gauge-circular':
      case 'gauge-progress':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rótulo</Label>
              <Input
                value={config.label || ''}
                onChange={(e) => handleConfigChange('label', e.target.value)}
                placeholder="Ex: Taxa de Conclusão"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Mínimo</Label>
                <Input
                  type="number"
                  value={config.minValue || 0}
                  onChange={(e) => handleConfigChange('minValue', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Máximo</Label>
                <Input
                  type="number"
                  value={config.maxValue || 100}
                  onChange={(e) => handleConfigChange('maxValue', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Limite de Aviso</Label>
                <Input
                  type="number"
                  value={config.warningThreshold || ''}
                  onChange={(e) => handleConfigChange('warningThreshold', Number(e.target.value))}
                  placeholder="Ex: 70"
                />
              </div>
              <div className="space-y-2">
                <Label>Limite Crítico</Label>
                <Input
                  type="number"
                  value={config.criticalThreshold || ''}
                  onChange={(e) => handleConfigChange('criticalThreshold', Number(e.target.value))}
                  placeholder="Ex: 90"
                />
              </div>
            </div>
          </div>
        );

      case 'chart-line':
      case 'chart-area':
      case 'chart-bar':
      case 'chart-bar-horizontal':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Período de Tempo</Label>
              <Select 
                value={config.timeRange || '7d'} 
                onValueChange={(value) => handleConfigChange('timeRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Última hora</SelectItem>
                  <SelectItem value="6h">Últimas 6 horas</SelectItem>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Intervalo de Atualização</Label>
              <Select 
                value={String(config.refreshInterval || 60000)} 
                onValueChange={(value) => handleConfigChange('refreshInterval', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30000">30 segundos</SelectItem>
                  <SelectItem value="60000">1 minuto</SelectItem>
                  <SelectItem value="300000">5 minutos</SelectItem>
                  <SelectItem value="600000">10 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'indicator-status':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rótulo</Label>
              <Input
                value={config.label || ''}
                onChange={(e) => handleConfigChange('label', e.target.value)}
                placeholder="Ex: Sistema Principal"
              />
            </div>
            <div className="space-y-2">
              <Label>Status Padrão</Label>
              <Select 
                value={config.status || 'ok'} 
                onValueChange={(value) => handleConfigChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">Operacional</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'indicator-trend':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rótulo</Label>
              <Input
                value={config.label || ''}
                onChange={(e) => handleConfigChange('label', e.target.value)}
                placeholder="Ex: vs período anterior"
              />
            </div>
            <div className="space-y-2">
              <Label>Tendência</Label>
              <Select 
                value={config.trend || 'up'} 
                onValueChange={(value) => handleConfigChange('trend', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="up">Subindo</SelectItem>
                  <SelectItem value="down">Descendo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                placeholder="Ex: +12%"
              />
            </div>
          </div>
        );

      case 'text-display':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Texto</Label>
              <Textarea
                value={config.text || ''}
                onChange={(e) => handleConfigChange('text', e.target.value)}
                placeholder="Digite o texto que deseja exibir..."
                rows={4}
              />
            </div>
          </div>
        );

      case 'photo-display':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input
                value={config.imageUrl || ''}
                onChange={(e) => handleConfigChange('imageUrl', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Este widget usa dados dinâmicos do sistema.</p>
            <p className="text-sm mt-2">Configure apenas as opções gerais.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar Widget
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="w-4 h-4" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Aparência
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="general" className="space-y-4 px-1">
              <div className="space-y-2">
                <Label>Título do Widget</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tamanho</Label>
                <Select value={size} onValueChange={(value: any) => setSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="col-1">1 Coluna (Pequeno)</SelectItem>
                    <SelectItem value="col-2">2 Colunas</SelectItem>
                    <SelectItem value="col-3">3 Colunas (Médio)</SelectItem>
                    <SelectItem value="col-4">4 Colunas</SelectItem>
                    <SelectItem value="col-5">5 Colunas</SelectItem>
                    <SelectItem value="col-6">6 Colunas (Largura Total)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <strong>Tipo:</strong> {widget.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </TabsContent>

            <TabsContent value="data" className="px-1">
              {renderTypeSpecificConfig()}
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 px-1">
              <div className="space-y-2">
                <Label>Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.color || '#006b76'}
                    onChange={(e) => handleConfigChange('color', e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.color || '#006b76'}
                    onChange={(e) => handleConfigChange('color', e.target.value)}
                    placeholder="#006b76"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Casas Decimais</Label>
                <Select 
                  value={String(config.decimals ?? 0)} 
                  onValueChange={(value) => handleConfigChange('decimals', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem decimais</SelectItem>
                    <SelectItem value="1">1 casa decimal</SelectItem>
                    <SelectItem value="2">2 casas decimais</SelectItem>
                    <SelectItem value="3">3 casas decimais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
