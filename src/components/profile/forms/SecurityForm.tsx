import { useState, useCallback } from 'react';
import { Key, Shield, Eye, EyeOff, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUsers } from '@/data/usersStore';
import { changePassword } from '@/services/authService';
import { toast } from 'sonner';
import type { User } from '@/models/user';

interface SecurityFormProps {
  security: User['security'];
  onSave: (security: NonNullable<User['security']>) => void;
}

const defaultSecurity = {
  two_factor_enabled: false,
  recovery_codes: [],
};

export function SecurityForm({ security, onSave }: SecurityFormProps) {
  const [formData, setFormData] = useState({
    ...defaultSecurity,
    ...security,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());

  const { generateRecoveryCodes } = useUsers();

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) errors.push('deve ter pelo menos 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('deve conter pelo menos uma letra maiúscula');
    if (!/[0-9]/.test(password)) errors.push('deve conter pelo menos um número');
    return errors;
  };

  const validatePasswordForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else {
      const passwordValidationErrors = validatePassword(passwordData.newPassword);
      if (passwordValidationErrors.length > 0) {
        newErrors.newPassword = `Nova senha ${passwordValidationErrors.join(', ')}`;
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação da senha é obrigatória';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwordData]);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      
      // Limpar formulário
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Senha alterada com sucesso');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.old_password?.[0] ||
                          error.response?.data?.new_password?.[0] ||
                          'Erro ao alterar senha';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    if (enabled && !formData.two_factor_enabled) {
      // Ativar 2FA - gerar códigos de recuperação
      const recoveryCodes = generateRecoveryCodes();
      const newSecurity = {
        ...formData,
        two_factor_enabled: true,
        recovery_codes: recoveryCodes,
      };
      
      setFormData(newSecurity);
      onSave(newSecurity);
      setShowRecoveryCodes(true);
      
      toast.success('Autenticação de dois fatores ativada');
    } else if (!enabled && formData.two_factor_enabled) {
      // Desativar 2FA
      const newSecurity = {
        ...formData,
        two_factor_enabled: false,
        recovery_codes: [],
      };
      
      setFormData(newSecurity);
      onSave(newSecurity);
      
      toast.success('Autenticação de dois fatores desativada');
    }
  };

  const handleCopyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodes(prev => new Set([...prev, code]));
      
      // Remover o estado de copiado após 2 segundos
      setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(code);
          return newSet;
        });
      }, 2000);
      
      toast.success('Código copiado para a área de transferência');
    } catch (error) {
      toast.error('Erro ao copiar código');
    }
  }, []);

  const handleCopyAllCodes = useCallback(async () => {
    try {
      const allCodes = formData.recovery_codes?.join('\n') || '';
      await navigator.clipboard.writeText(allCodes);
      toast.success('Todos os códigos copiados para a área de transferência');
    } catch (error) {
      toast.error('Erro ao copiar códigos');
    }
  }, [formData.recovery_codes]);

  return (
    <div
      role="tabpanel"
      aria-labelledby="tab-seguranca"
      id="panel-seguranca"
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-medium mb-2">Configurações de Segurança</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie sua senha e configurações de autenticação.
        </p>
      </div>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Para sua segurança, use uma senha forte e única.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Senha Atual */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-medium">
                Senha Atual *
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  aria-invalid={!!passwordErrors.currentPassword}
                  aria-describedby={passwordErrors.currentPassword ? 'current-password-error' : undefined}
                  className={passwordErrors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => togglePasswordVisibility('current')}
                  aria-label={showPasswords.current ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {passwordErrors.currentPassword && (
                <p id="current-password-error" role="alert" className="text-sm text-destructive">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                Nova Senha *
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  aria-invalid={!!passwordErrors.newPassword}
                  aria-describedby={passwordErrors.newPassword ? 'new-password-error' : undefined}
                  className={passwordErrors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => togglePasswordVisibility('new')}
                  aria-label={showPasswords.new ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {passwordErrors.newPassword && (
                <p id="new-password-error" role="alert" className="text-sm text-destructive">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirmar Nova Senha *
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  aria-invalid={!!passwordErrors.confirmPassword}
                  aria-describedby={passwordErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  className={passwordErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => togglePasswordVisibility('confirm')}
                  aria-label={showPasswords.confirm ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {passwordErrors.confirmPassword && (
                <p id="confirm-password-error" role="alert" className="text-sm text-destructive">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Autenticação de Dois Fatores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {formData.two_factor_enabled ? 'Ativada' : 'Desativada'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData.two_factor_enabled 
                  ? 'Sua conta está protegida com autenticação de dois fatores'
                  : 'Ative para aumentar a segurança da sua conta'
                }
              </p>
            </div>
            <Switch
              checked={formData.two_factor_enabled}
              onCheckedChange={handleToggle2FA}
              aria-label="Ativar ou desativar autenticação de dois fatores"
            />
          </div>

          {formData.two_factor_enabled && formData.recovery_codes && formData.recovery_codes.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Códigos de Recuperação</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAllCodes}
                  className="flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copiar Todos
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Guarde estes códigos em local seguro. Use-os para recuperar acesso se perder seu dispositivo de autenticação.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {formData.recovery_codes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-background p-2 rounded border text-sm font-mono"
                  >
                    <span>{code}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(code)}
                      className="h-auto p-1"
                      aria-label={`Copiar código ${code}`}
                    >
                      {copiedCodes.has(code) ? (
                        <CheckCheck className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de códigos de recuperação */}
      <Dialog open={showRecoveryCodes} onOpenChange={setShowRecoveryCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Códigos de Recuperação</DialogTitle>
            <DialogDescription>
              Guarde estes códigos em local seguro. Você precisará deles para acessar sua conta se perder o acesso ao dispositivo de autenticação.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {formData.recovery_codes?.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted p-2 rounded text-sm font-mono"
                >
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(code)}
                    className="h-auto p-1"
                    aria-label={`Copiar código ${code}`}
                  >
                    {copiedCodes.has(code) ? (
                      <CheckCheck className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleCopyAllCodes}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Todos
              </Button>
              
              <Button onClick={() => setShowRecoveryCodes(false)}>
                Entendi, Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}