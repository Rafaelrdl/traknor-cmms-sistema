/**
 * SettingsPage - Página de Configurações
 * 
 * Layout de plataforma com sidebar de navegação e conteúdo ocupando toda a tela.
 * Permite configurar:
 * - SLA de atendimento e fechamento por prioridade
 * - Status personalizados de ordens de serviço
 * - Tipos de serviço personalizados
 * - Notificações do sistema
 * - Integrações
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown,
  Timer,
  CheckCircle2,
  Settings2,
  Plus,
  Trash2,
  ClipboardList,
  Tag,
  Palette,
  Bell,
  Shield,
  Plug,
  Building2,
  Save,
  RotateCcw,
  ChevronRight,
  Info
} from 'lucide-react';
import { useSLAStore, type SLASettings } from '@/store/useSLAStore';
import { 
  useWorkOrderSettingsStore, 
  type WorkOrderSettings,
  type WorkOrderStatusConfig,
  type WorkOrderTypeConfig 
} from '@/store/useWorkOrderSettingsStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Configurações de prioridade para SLA
const priorityLabels = {
  CRITICAL: { label: 'Crítica', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  HIGH: { label: 'Alta', icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
  MEDIUM: { label: 'Média', icon: ArrowUp, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  LOW: { label: 'Baixa', icon: ArrowDown, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
};

// Opções de cores para status/tipos
const colorOptions = [
  { value: '#3b82f6', label: 'Azul', class: 'bg-blue-500' },
  { value: '#22c55e', label: 'Verde', class: 'bg-green-500' },
  { value: '#f59e0b', label: 'Amarelo', class: 'bg-amber-500' },
  { value: '#ef4444', label: 'Vermelho', class: 'bg-red-500' },
  { value: '#8b5cf6', label: 'Roxo', class: 'bg-purple-500' },
  { value: '#ec4899', label: 'Rosa', class: 'bg-pink-500' },
  { value: '#14b8a6', label: 'Teal', class: 'bg-teal-500' },
  { value: '#6b7280', label: 'Cinza', class: 'bg-gray-500' },
];

// Seções de configuração
type SettingSection = 'work-orders' | 'sla' | 'notifications' | 'organization' | 'integrations';

const settingSections: { 
  id: SettingSection; 
  label: string; 
  icon: React.ElementType; 
  description: string;
}[] = [
  { 
    id: 'work-orders', 
    label: 'Ordens de Serviço', 
    icon: ClipboardList, 
    description: 'Status e tipos de serviço' 
  },
  { 
    id: 'sla', 
    label: 'SLA', 
    icon: Timer, 
    description: 'Tempos de atendimento' 
  },
  { 
    id: 'notifications', 
    label: 'Notificações', 
    icon: Bell, 
    description: 'Alertas e avisos' 
  },
  { 
    id: 'organization', 
    label: 'Organização', 
    icon: Building2, 
    description: 'Dados da empresa' 
  },
  { 
    id: 'integrations', 
    label: 'Integrações', 
    icon: Plug, 
    description: 'APIs e conexões' 
  },
];

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SettingSection>(
    (searchParams.get('section') as SettingSection) || 'work-orders'
  );
  const [hasChanges, setHasChanges] = useState(false);
  
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

  // Atualiza URL quando muda a seção
  useEffect(() => {
    setSearchParams({ section: activeSection });
  }, [activeSection, setSearchParams]);

  // Detecta mudanças
  useEffect(() => {
    const slaChanged = JSON.stringify(localSLASettings) !== JSON.stringify(slaSettings);
    const woChanged = JSON.stringify(localWOSettings) !== JSON.stringify(woSettings);
    setHasChanges(slaChanged || woChanged);
  }, [localSLASettings, localWOSettings, slaSettings, woSettings]);

  const handleSave = () => {
    setSLASettings(localSLASettings);
    setWOSettings(localWOSettings);
    setHasChanges(false);
    toast.success('Configurações salvas com sucesso');
  };

  const handleReset = () => {
    setLocalSLASettings(slaSettings);
    setLocalWOSettings(woSettings);
    setHasChanges(false);
    toast.info('Alterações descartadas');
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
  };

  const handleRemoveStatus = (id: string) => {
    setLocalWOSettings((prev) => ({
      ...prev,
      statuses: prev.statuses.filter((s) => s.id !== id),
    }));
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
  };

  const handleRemoveType = (id: string) => {
    setLocalWOSettings((prev) => ({
      ...prev,
      types: prev.types.filter((t) => t.id !== id),
    }));
  };

  // Renderiza o conteúdo baseado na seção ativa
  const renderContent = () => {
    switch (activeSection) {
      case 'work-orders':
        return <WorkOrdersSection 
          localWOSettings={localWOSettings}
          newStatusLabel={newStatusLabel}
          setNewStatusLabel={setNewStatusLabel}
          newStatusColor={newStatusColor}
          setNewStatusColor={setNewStatusColor}
          newTypeLabel={newTypeLabel}
          setNewTypeLabel={setNewTypeLabel}
          newTypeColor={newTypeColor}
          setNewTypeColor={setNewTypeColor}
          handleAddStatus={handleAddStatus}
          handleRemoveStatus={handleRemoveStatus}
          handleAddType={handleAddType}
          handleRemoveType={handleRemoveType}
        />;
      case 'sla':
        return <SLASection 
          localSLASettings={localSLASettings}
          setLocalSLASettings={setLocalSLASettings}
          updatePrioritySLA={updatePrioritySLA}
        />;
      case 'notifications':
        return <NotificationsSection />;
      case 'organization':
        return <OrganizationSection />;
      case 'integrations':
        return <IntegrationsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header fixo */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Configurações</h1>
              <p className="text-sm text-muted-foreground">
                Personalize o sistema de acordo com suas necessidades
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Info className="h-3 w-3 mr-1" />
                Alterações não salvas
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={!hasChanges}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Descartar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com sidebar */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar de navegação */}
        <aside className="w-64 flex-shrink-0 border-r bg-muted/30">
          <ScrollArea className="h-full">
            <nav className="p-4 space-y-1">
              {settingSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-medium text-sm", isActive && "text-primary-foreground")}>
                        {section.label}
                      </div>
                      <div className={cn(
                        "text-xs truncate",
                        isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {section.description}
                      </div>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-primary-foreground/70" />}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Área de conteúdo */}
        <main className="flex-1 min-w-0 bg-muted/10">
          <ScrollArea className="h-full">
            <div className="p-6">
              {renderContent()}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

// ==================== SEÇÕES ====================

interface WorkOrdersSectionProps {
  localWOSettings: WorkOrderSettings;
  newStatusLabel: string;
  setNewStatusLabel: (value: string) => void;
  newStatusColor: string;
  setNewStatusColor: (value: string) => void;
  newTypeLabel: string;
  setNewTypeLabel: (value: string) => void;
  newTypeColor: string;
  setNewTypeColor: (value: string) => void;
  handleAddStatus: () => void;
  handleRemoveStatus: (id: string) => void;
  handleAddType: () => void;
  handleRemoveType: (id: string) => void;
}

function WorkOrdersSection({
  localWOSettings,
  newStatusLabel,
  setNewStatusLabel,
  newStatusColor,
  setNewStatusColor,
  newTypeLabel,
  setNewTypeLabel,
  newTypeColor,
  setNewTypeColor,
  handleAddStatus,
  handleRemoveStatus,
  handleAddType,
  handleRemoveType,
}: WorkOrdersSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Configuração de Ordens de Serviço
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personalize os status e tipos de serviço disponíveis para as ordens de serviço.
        </p>
      </div>

      {/* Grid de duas colunas para Status e Tipos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status Section */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Status de Ordem de Serviço
            </CardTitle>
            <CardDescription>
              Defina os status que uma ordem de serviço pode ter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de status existentes */}
            <div className="grid grid-cols-2 gap-2">
              {localWOSettings.statuses.map((status) => (
                <div 
                  key={status.id}
                  className="group flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border-2" 
                      style={{ backgroundColor: status.color, borderColor: status.color }}
                    />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  {status.isDefault ? (
                    <Badge variant="secondary" className="text-[10px]">Padrão</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      onClick={() => handleRemoveStatus(status.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Separator />
            
            {/* Formulário para adicionar novo status */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-dashed">
              <div className="space-y-2">
                <Label htmlFor="new-status" className="text-sm">Novo Status</Label>
                <Input
                  id="new-status"
                  placeholder="Ex: Em Análise, Aguardando Peças..."
                  value={newStatusLabel}
                  onChange={(e) => setNewStatusLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
                  className="h-9"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full transition-all",
                        color.class,
                        newStatusColor === color.value 
                          ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      )}
                      onClick={() => setNewStatusColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
                <Button onClick={handleAddStatus} size="sm" className="h-8 gap-1.5">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Types Section */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Tipos de Serviço
            </CardTitle>
            <CardDescription>
              Categorize as ordens de serviço por tipo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de tipos existentes */}
            <div className="grid grid-cols-2 gap-2">
              {localWOSettings.types.map((type) => (
                <div 
                  key={type.id}
                  className="group flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border-2" 
                      style={{ backgroundColor: type.color, borderColor: type.color }}
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  {type.isDefault ? (
                    <Badge variant="secondary" className="text-[10px]">Padrão</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      onClick={() => handleRemoveType(type.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Separator />
            
            {/* Formulário para adicionar novo tipo */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-dashed">
              <div className="space-y-2">
                <Label htmlFor="new-type" className="text-sm">Novo Tipo de Serviço</Label>
                <Input
                  id="new-type"
                  placeholder="Ex: Emergencial, Instalação..."
                  value={newTypeLabel}
                  onChange={(e) => setNewTypeLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                  className="h-9"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full transition-all",
                        color.class,
                        newTypeColor === color.value 
                          ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      )}
                      onClick={() => setNewTypeColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
                <Button onClick={handleAddType} size="sm" className="h-8 gap-1.5">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SLASectionProps {
  localSLASettings: SLASettings;
  setLocalSLASettings: React.Dispatch<React.SetStateAction<SLASettings>>;
  updatePrioritySLA: (
    priority: keyof SLASettings['priorities'],
    field: 'responseTime' | 'resolutionTime',
    value: string
  ) => void;
}

function SLASection({ localSLASettings, setLocalSLASettings, updatePrioritySLA }: SLASectionProps) {
  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Configuração de SLA
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Defina os tempos máximos de atendimento e resolução para cada nível de prioridade.
        </p>
      </div>

      {/* Toggle SLA + Legenda lado a lado */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Toggle SLA */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl transition-colors",
                  localSLASettings.enabled ? "bg-green-500/10" : "bg-muted"
                )}>
                  <Timer className={cn(
                    "h-6 w-6 transition-colors",
                    localSLASettings.enabled ? "text-green-600" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <div className="font-medium">Controle de SLA</div>
                  <p className="text-sm text-muted-foreground">
                    {localSLASettings.enabled 
                      ? 'Os indicadores de SLA estão visíveis nas ordens de serviço' 
                      : 'Ative para monitorar tempos de atendimento e resolução'}
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
          </CardContent>
        </Card>

        {/* Legenda */}
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 h-full">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">SLA de Atendimento</div>
                  <div className="text-xs text-muted-foreground">Tempo máximo para iniciar a OS</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">SLA de Fechamento</div>
                  <div className="text-xs text-muted-foreground">Tempo máximo para concluir a OS</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações por prioridade - Grid de 2 colunas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {(Object.keys(priorityLabels) as Array<keyof typeof priorityLabels>).map((priority) => {
          const { label, icon: Icon, color, bgColor, borderColor } = priorityLabels[priority];
          const config = localSLASettings.priorities[priority];

          return (
            <Card 
              key={priority} 
              className={cn(
                "transition-all",
                !localSLASettings.enabled && "opacity-50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Ícone e Label */}
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", bgColor)}>
                      <Icon className={cn("h-5 w-5", color)} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Prioridade {label}</div>
                      <Badge variant="outline" className={cn("text-[10px] mt-0.5", borderColor)}>
                        {priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="flex-1 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <Input
                        type="number"
                        min="0"
                        value={config.responseTime}
                        onChange={(e) => updatePrioritySLA(priority, 'responseTime', e.target.value)}
                        className="w-16 h-8 text-center text-sm"
                        disabled={!localSLASettings.enabled}
                      />
                      <span className="text-xs text-muted-foreground">h</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <Input
                        type="number"
                        min="0"
                        value={config.resolutionTime}
                        onChange={(e) => updatePrioritySLA(priority, 'resolutionTime', e.target.value)}
                        className="w-16 h-8 text-center text-sm"
                        disabled={!localSLASettings.enabled}
                      />
                      <span className="text-xs text-muted-foreground">h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [slaBreach, setSlaBreach] = useState(true);
  const [newWorkOrder, setNewWorkOrder] = useState(true);
  const [statusChange, setStatusChange] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Configuração de Notificações
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Defina como e quando você deseja receber alertas e notificações do sistema.
        </p>
      </div>

      {/* Grid de duas colunas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Canais de notificação */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Canais de Notificação</CardTitle>
            <CardDescription>
              Escolha os meios pelos quais deseja receber notificações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Notificações por Email</div>
                  <div className="text-xs text-muted-foreground">Receba alertas no seu email</div>
                </div>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-500/10">
                  <Bell className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Notificações Push</div>
                  <div className="text-xs text-muted-foreground">Alertas em tempo real no navegador</div>
                </div>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Tipos de notificação */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Eventos de Notificação</CardTitle>
            <CardDescription>
              Selecione os eventos que devem gerar notificações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between py-2.5 px-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">Violação de SLA</div>
                <div className="text-xs text-muted-foreground">Quando uma OS ultrapassa o tempo de SLA</div>
              </div>
              <Switch checked={slaBreach} onCheckedChange={setSlaBreach} />
            </div>
            
            <div className="flex items-center justify-between py-2.5 px-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">Nova Ordem de Serviço</div>
                <div className="text-xs text-muted-foreground">Quando uma nova OS é criada</div>
              </div>
              <Switch checked={newWorkOrder} onCheckedChange={setNewWorkOrder} />
            </div>
            
            <div className="flex items-center justify-between py-2.5 px-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">Mudança de Status</div>
                <div className="text-xs text-muted-foreground">Quando o status de uma OS é alterado</div>
              </div>
              <Switch checked={statusChange} onCheckedChange={setStatusChange} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrganizationSection() {
  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Dados da Organização
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Informações gerais sobre sua empresa.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Linha 1: Nome e CNPJ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="org-name">Nome da Empresa</Label>
              <Input id="org-name" placeholder="Nome da empresa" defaultValue="UMC - Universidade de Mogi das Cruzes" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-cnpj">CNPJ</Label>
              <Input id="org-cnpj" placeholder="00.000.000/0000-00" defaultValue="52.562.758/0001-00" />
            </div>
          </div>
          
          {/* Linha 2: Endereço */}
          <div className="space-y-2">
            <Label htmlFor="org-address">Endereço</Label>
            <Input id="org-address" placeholder="Endereço completo" defaultValue="Av. Dr. Cândido Xavier de Almeida Souza, 200" />
          </div>
          
          {/* Linha 3: Cidade, Estado, CEP */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="org-city">Cidade</Label>
              <Input id="org-city" placeholder="Cidade" defaultValue="Mogi das Cruzes" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-state">Estado</Label>
              <Input id="org-state" placeholder="UF" defaultValue="SP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-cep">CEP</Label>
              <Input id="org-cep" placeholder="00000-000" defaultValue="08780-911" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-phone">Telefone</Label>
              <Input id="org-phone" placeholder="(00) 0000-0000" defaultValue="(11) 4798-7000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-email">Email</Label>
              <Input id="org-email" type="email" placeholder="contato@empresa.com" defaultValue="contato@umc.br" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          Integrações
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte o TrakNor com outros sistemas e serviços.
        </p>
      </div>

      {/* Grid de integrações */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* API */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">API REST</div>
                  <p className="text-xs text-muted-foreground">
                    Integre via API
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                Conectado
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Webhook */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10">
                  <Plug className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Webhooks</div>
                  <p className="text-xs text-muted-foreground">
                    Eventos em tempo real
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">Configurar</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* ERP */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10">
                  <Building2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Integração ERP</div>
                  <p className="text-xs text-muted-foreground">
                    Sistema de gestão
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">Conectar</Button>
            </div>
          </CardContent>
        </Card>

        {/* MQTT */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10">
                  <Plug className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">MQTT Broker</div>
                  <p className="text-xs text-muted-foreground">
                    IoT e sensores
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                Conectado
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10">
                  <Bell className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">SMTP Email</div>
                  <p className="text-xs text-muted-foreground">
                    Envio de notificações
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">Configurar</Button>
            </div>
          </CardContent>
        </Card>

        {/* SSO */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">SSO / SAML</div>
                  <p className="text-xs text-muted-foreground">
                    Login único corporativo
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">Conectar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
