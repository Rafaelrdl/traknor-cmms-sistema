/**
 * SettingsPage - Página de Configurações
 * 
 * Permite configurar:
 * - SLA de atendimento e fechamento por prioridade
 * - Status personalizados de ordens de serviço
 * - Tipos de serviço personalizados
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown,
  Timer,
  CheckCircle2,
  Settings2,
  ArrowLeft,
  Plus,
  Trash2,
  ClipboardList,
  Tag,
  Palette
} from 'lucide-react';
import { useSLAStore, type SLASettings } from '@/store/useSLAStore';
import { 
  useWorkOrderSettingsStore, 
  type WorkOrderSettings,
  type WorkOrderStatusConfig,
  type WorkOrderTypeConfig 
} from '@/store/useWorkOrderSettingsStore';
import { toast } from 'sonner';

const priorityLabels = {
  CRITICAL: { label: 'Crítica', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-100' },
  HIGH: { label: 'Alta', icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  MEDIUM: { label: 'Média', icon: ArrowUp, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  LOW: { label: 'Baixa', icon: ArrowDown, color: 'text-blue-500', bgColor: 'bg-blue-100' },
};

const colorOptions = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#f59e0b', label: 'Amarelo' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#6b7280', label: 'Cinza' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  
  // SLA Store
  const { settings: slaSettings, setSettings: setSLASettings } = useSLAStore();
  const [localSLASettings, setLocalSLASettings] = useState<SLASettings>(slaSettings);
  
  // Work Order Settings Store
  const { settings: woSettings, setSettings: setWOSettings } = useWorkOrderSettingsStore();
  const [localWOSettings, setLocalWOSettings] = useState<WorkOrderSettings>(woSettings);
  
  // New status/type form
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#3b82f6');
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#3b82f6');

  // Sincroniza quando a página carrega
  useEffect(() => {
    setLocalSLASettings(slaSettings);
    setLocalWOSettings(woSettings);
  }, [slaSettings, woSettings]);

  const handleSave = () => {
    setSLASettings(localSLASettings);
    setWOSettings(localWOSettings);
    toast.success('Configurações salvas com sucesso');
  };

  const handleCancel = () => {
    setLocalSLASettings(slaSettings);
    setLocalWOSettings(woSettings);
    navigate(-1);
  };

  const updatePrioritySLA = (
    priority: keyof SLASettings['priorities'],
    field: 'responseTime' | 'resolutionTime',
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setLocalSLASettings((prev) => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: {
          ...prev.priorities[priority],
          [field]: numValue,
        },
      },
    }));
  };

  const handleAddStatus = () => {
    if (!newStatusLabel.trim()) {
      toast.error('Digite um nome para o status');
      return;
    }
    
    const newStatus: WorkOrderStatusConfig = {
      id: `custom_${Date.now()}`,
      label: newStatusLabel.trim(),
      color: newStatusColor,
      isDefault: false,
    };
    
    setLocalWOSettings((prev) => ({
      ...prev,
      statuses: [...prev.statuses, newStatus],
    }));
    
    setNewStatusLabel('');
    setNewStatusColor('#3b82f6');
    toast.success('Status adicionado');
  };

  const handleRemoveStatus = (id: string) => {
    setLocalWOSettings((prev) => ({
      ...prev,
      statuses: prev.statuses.filter((s) => s.id !== id),
    }));
    toast.success('Status removido');
  };

  const handleAddType = () => {
    if (!newTypeLabel.trim()) {
      toast.error('Digite um nome para o tipo de serviço');
      return;
    }
    
    const newType: WorkOrderTypeConfig = {
      id: `custom_${Date.now()}`,
      label: newTypeLabel.trim(),
      color: newTypeColor,
      isDefault: false,
    };
    
    setLocalWOSettings((prev) => ({
      ...prev,
      types: [...prev.types, newType],
    }));
    
    setNewTypeLabel('');
    setNewTypeColor('#3b82f6');
    toast.success('Tipo de serviço adicionado');
  };

  const handleRemoveType = (id: string) => {
    setLocalWOSettings((prev) => ({
      ...prev,
      types: prev.types.filter((t) => t.id !== id),
    }));
    toast.success('Tipo de serviço removido');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-primary" />
              Configuração
            </h1>
            <p className="text-muted-foreground">
              Configure os parâmetros do sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </div>
      </div>

      {/* Work Order Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Configuração de Ordens de Serviço
          </CardTitle>
          <CardDescription>
            Configure os status e tipos de serviço disponíveis para as ordens de serviço.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Status de Ordem de Serviço</h3>
            </div>
            
            {/* Current Statuses */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {localWOSettings.statuses.map((status) => (
                <div 
                  key={status.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  {!status.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveStatus(status.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  {status.isDefault && (
                    <Badge variant="secondary" className="text-xs">Padrão</Badge>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add New Status */}
            <div className="flex items-end gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-status">Novo Status</Label>
                <Input
                  id="new-status"
                  placeholder="Ex: Em Análise, Aguardando Peças..."
                  value={newStatusLabel}
                  onChange={(e) => setNewStatusLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        newStatusColor === color.value 
                          ? 'border-primary scale-110' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewStatusColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddStatus} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Types Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Tipos de Serviço</h3>
            </div>
            
            {/* Current Types */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {localWOSettings.types.map((type) => (
                <div 
                  key={type.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  {!type.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveType(type.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  {type.isDefault && (
                    <Badge variant="secondary" className="text-xs">Padrão</Badge>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add New Type */}
            <div className="flex items-end gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-type">Novo Tipo de Serviço</Label>
                <Input
                  id="new-type"
                  placeholder="Ex: Emergencial, Instalação..."
                  value={newTypeLabel}
                  onChange={(e) => setNewTypeLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        newTypeColor === color.value 
                          ? 'border-primary scale-110' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewTypeColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddType} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SLA Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Configuração de SLA
          </CardTitle>
          <CardDescription>
            Configure os tempos de SLA de atendimento e fechamento para cada nível de prioridade das ordens de serviço.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle para ativar/desativar SLA */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${localSLASettings.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Timer className={`h-5 w-5 ${localSLASettings.enabled ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="font-medium">Controle de SLA</p>
                <p className="text-sm text-muted-foreground">
                  {localSLASettings.enabled 
                    ? 'As colunas de SLA serão exibidas na lista de ordens de serviço' 
                    : 'Ative para visualizar os indicadores de SLA'}
                </p>
              </div>
            </div>
            <Switch
              checked={localSLASettings.enabled}
              onCheckedChange={(checked) => 
                setLocalSLASettings((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <Separator />

          {/* Legenda */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">SLA de Atendimento:</span>
              <span>Tempo máximo para iniciar a OS</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">SLA de Fechamento:</span>
              <span>Tempo máximo para concluir a OS</span>
            </div>
          </div>

          {/* Configurações por prioridade */}
          <div className="space-y-4">
            {(Object.keys(priorityLabels) as Array<keyof typeof priorityLabels>).map((priority) => {
              const { label, icon: Icon, color, bgColor } = priorityLabels[priority];
              const config = localSLASettings.priorities[priority];

              return (
                <div 
                  key={priority} 
                  className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-1.5 rounded ${bgColor}`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <span className="font-medium">Prioridade {label}</span>
                    <Badge variant="outline" className="ml-auto">
                      {priority}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${priority}-response`} className="text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        SLA de Atendimento
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`${priority}-response`}
                          type="number"
                          min="0"
                          value={config.responseTime}
                          onChange={(e) => updatePrioritySLA(priority, 'responseTime', e.target.value)}
                          className="w-24"
                          disabled={!localSLASettings.enabled}
                        />
                        <span className="text-sm text-muted-foreground">horas</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${priority}-resolution`} className="text-sm flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        SLA de Fechamento
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`${priority}-resolution`}
                          type="number"
                          min="0"
                          value={config.resolutionTime}
                          onChange={(e) => updatePrioritySLA(priority, 'resolutionTime', e.target.value)}
                          className="w-24"
                          disabled={!localSLASettings.enabled}
                        />
                        <span className="text-sm text-muted-foreground">horas</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
