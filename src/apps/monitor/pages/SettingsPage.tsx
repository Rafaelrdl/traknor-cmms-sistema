/**
 * SettingsPage - Página de Configurações do Monitor
 * 
 * Configurações gerais do módulo de monitoramento IoT.
 */

import { useState } from 'react';
import { Settings, Thermometer, Globe, Bell, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    temperatureUnit: 'celsius',
    timezone: 'America/Sao_Paulo',
    thresholds: {
      filterPressure: 250,
      vibrationLimit: 5,
      temperatureDeviation: 3
    },
    notifications: {
      email: true,
      browser: true,
      sms: false,
      whatsapp: false
    },
    autoRefresh: true,
    refreshInterval: 30
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleNestedChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof typeof prev] as any, [key]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Aqui você pode integrar com a API para salvar as configurações
    toast.success('Configurações salvas com sucesso!');
    setHasChanges(false);
  };

  const handleReset = () => {
    toast.info('Configurações redefinidas para os valores padrão');
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Personalização do sistema de monitoramento e parâmetros operacionais"
        icon={<Settings className="h-6 w-6" />}
      >
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Redefinir
            </Button>
          )}
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </div>
      </PageHeader>

      {/* Units Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Unidades de Medida
          </CardTitle>
          <CardDescription>
            Configure as unidades de medida utilizadas nos gráficos e relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="temperature-unit">Temperatura</Label>
              <Select
                value={settings.temperatureUnit}
                onValueChange={(value) => handleChange('temperatureUnit', value)}
              >
                <SelectTrigger id="temperature-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="airflow-unit">Vazão de Ar</Label>
              <Select defaultValue="m3h">
                <SelectTrigger id="airflow-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m3h">m³/h</SelectItem>
                  <SelectItem value="cfm">CFM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Configurações Regionais
          </CardTitle>
          <CardDescription>
            Ajuste o fuso horário e formato de data/hora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleChange('timezone', value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-format">Formato de Data</Label>
              <Select defaultValue="dd/mm/yyyy">
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como deseja receber alertas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notif" className="text-base">Notificações por E-mail</Label>
                <p className="text-sm text-muted-foreground">Receber alertas via e-mail</p>
              </div>
              <Switch
                id="email-notif"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleNestedChange('notifications', 'email', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notif" className="text-base">Notificações do Navegador</Label>
                <p className="text-sm text-muted-foreground">Receber notificações push</p>
              </div>
              <Switch
                id="browser-notif"
                checked={settings.notifications.browser}
                onCheckedChange={(checked) => handleNestedChange('notifications', 'browser', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notif" className="text-base">Notificações por SMS</Label>
                <p className="text-sm text-muted-foreground">Receber alertas críticos via SMS</p>
              </div>
              <Switch
                id="sms-notif"
                checked={settings.notifications.sms}
                onCheckedChange={(checked) => handleNestedChange('notifications', 'sms', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whatsapp-notif" className="text-base">Notificações por WhatsApp</Label>
                <p className="text-sm text-muted-foreground">Receber alertas via WhatsApp</p>
              </div>
              <Switch
                id="whatsapp-notif"
                checked={settings.notifications.whatsapp}
                onCheckedChange={(checked) => handleNestedChange('notifications', 'whatsapp', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Refresh */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Atualização de Dados
          </CardTitle>
          <CardDescription>
            Configure a frequência de atualização dos dados em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-refresh" className="text-base">Atualização Automática</Label>
                <p className="text-sm text-muted-foreground">Atualizar dados automaticamente</p>
              </div>
              <Switch
                id="auto-refresh"
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => handleChange('autoRefresh', checked)}
              />
            </div>

            {settings.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Intervalo de Atualização (segundos)</Label>
                <Select
                  value={String(settings.refreshInterval)}
                  onValueChange={(value) => handleChange('refreshInterval', parseInt(value))}
                >
                  <SelectTrigger id="refresh-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 segundos</SelectItem>
                    <SelectItem value="30">30 segundos</SelectItem>
                    <SelectItem value="60">1 minuto</SelectItem>
                    <SelectItem value="300">5 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
