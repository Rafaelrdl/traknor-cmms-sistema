/**
 * PreferencesModal - Modal de Preferências do Usuário
 * 
 * Configurações e preferências pessoais do usuário.
 */

import { useState } from 'react';
import { Settings, Thermometer, Globe, Bell, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesModal({ open, onOpenChange }: PreferencesModalProps) {
  const [settings, setSettings] = useState({
    temperatureUnit: 'celsius',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'dd/mm/yyyy',
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
    // Aqui você pode integrar com a API para salvar as preferências
    toast.success('Preferências salvas com sucesso!');
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleReset = () => {
    setSettings({
      temperatureUnit: 'celsius',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'dd/mm/yyyy',
      notifications: {
        email: true,
        browser: true,
        sms: false,
        whatsapp: false
      },
      autoRefresh: true,
      refreshInterval: 30
    });
    toast.info('Preferências redefinidas para os valores padrão');
    setHasChanges(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferências
          </DialogTitle>
          <DialogDescription>
            Personalize suas configurações e preferências do sistema
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Unidades de Medida */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium">Unidades de Medida</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
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
              </div>
            </div>

            <Separator />

            {/* Configurações Regionais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium">Configurações Regionais</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
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
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => handleChange('dateFormat', value)}
                  >
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
            </div>

            <Separator />

            {/* Notificações */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium">Notificações</h4>
              </div>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notif" className="text-sm">E-mail</Label>
                    <p className="text-xs text-muted-foreground">Receber alertas via e-mail</p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="browser-notif" className="text-sm">Navegador</Label>
                    <p className="text-xs text-muted-foreground">Notificações push</p>
                  </div>
                  <Switch
                    id="browser-notif"
                    checked={settings.notifications.browser}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'browser', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notif" className="text-sm">SMS</Label>
                    <p className="text-xs text-muted-foreground">Alertas críticos via SMS</p>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'sms', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp-notif" className="text-sm">WhatsApp</Label>
                    <p className="text-xs text-muted-foreground">Alertas via WhatsApp</p>
                  </div>
                  <Switch
                    id="whatsapp-notif"
                    checked={settings.notifications.whatsapp}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'whatsapp', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Atualização de Dados */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium">Atualização de Dados</h4>
              </div>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-refresh" className="text-sm">Atualização Automática</Label>
                    <p className="text-xs text-muted-foreground">Atualizar dados automaticamente</p>
                  </div>
                  <Switch
                    id="auto-refresh"
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => handleChange('autoRefresh', checked)}
                  />
                </div>

                {settings.autoRefresh && (
                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval">Intervalo</Label>
                    <Select
                      value={String(settings.refreshInterval)}
                      onValueChange={(value) => handleChange('refreshInterval', parseInt(value))}
                    >
                      <SelectTrigger id="refresh-interval" className="w-full">
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
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Redefinir
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
