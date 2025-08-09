import { useState, useCallback } from 'react';
import { Monitor, Sun, Moon, Mail, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { User } from '@/models/user';

interface PreferencesFormProps {
  preferences: User['preferences'];
  onSave: (preferences: NonNullable<User['preferences']>) => void;
}

const defaultPreferences = {
  theme: 'system' as const,
  language: 'pt-BR' as const,
  date_format: 'DD/MM/YYYY' as const,
  time_format: '24h' as const,
  notifications: {
    email: true,
    push: true,
  },
};

export function PreferencesForm({ preferences, onSave }: PreferencesFormProps) {
  const [formData, setFormData] = useState({
    ...defaultPreferences,
    ...preferences,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (type: 'email' | 'push', enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: enabled,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setIsLoading(true);
    try {
      await onSave(formData);
      toast.success('Preferências atualizadas com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar preferências');
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { value: 'system', label: 'Sistema', icon: Monitor },
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
  ];

  const languageOptions = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA (31/12/2024)' },
    { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD (2024-12-31)' },
  ];

  const timeFormatOptions = [
    { value: '24h', label: '24 horas (14:30)' },
    { value: '12h', label: '12 horas (2:30 PM)' },
  ];

  return (
    <div
      role="tabpanel"
      aria-labelledby="tab-preferencias"
      id="panel-preferencias"
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-medium mb-2">Preferências do Sistema</h3>
        <p className="text-sm text-muted-foreground">
          Personalize a aparência e o comportamento do sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tema */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tema</Label>
          <Select
            value={formData.theme}
            onValueChange={(value) => handleSelectChange('theme', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Escolha entre tema claro, escuro ou seguir as configurações do sistema
          </p>
        </div>

        {/* Idioma */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Idioma</Label>
          <Select
            value={formData.language}
            onValueChange={(value) => handleSelectChange('language', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Formato de Data */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Formato de Data</Label>
          <Select
            value={formData.date_format}
            onValueChange={(value) => handleSelectChange('date_format', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateFormatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Formato de Hora */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Formato de Hora</Label>
          <Select
            value={formData.time_format}
            onValueChange={(value) => handleSelectChange('time_format', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeFormatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notificações */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Notificações</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Configure como você deseja receber notificações do sistema
            </p>
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-border">
            {/* Notificações por Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Notificações por Email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receba atualizações por email sobre suas tarefas e solicitações
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={formData.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>

            {/* Notificações Push */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications" className="text-sm font-medium">
                    Notificações no Navegador
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receba notificações instantâneas no navegador
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={formData.notifications.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                ...defaultPreferences,
                ...preferences,
              });
            }}
            disabled={isLoading}
          >
            Restaurar Padrões
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </div>
      </form>
    </div>
  );
}