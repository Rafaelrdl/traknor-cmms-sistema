import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, User, Shield, Zap } from 'lucide-react';
import { useInvites } from '@/data/invitesStore';
import { toast } from 'sonner';
import type { Invite } from '@/models/invite';

interface OnboardingFormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getInviteByToken, acceptInvite } = useInvites();
  
  const [token] = useState(() => searchParams.get('token') || '');
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'validate' | 'form' | 'complete'>('validate');
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<OnboardingFormData>>({});

  // Validate invite token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de convite não encontrado na URL');
        setLoading(false);
        return;
      }

      try {
        const inviteData = getInviteByToken(token);
        if (!inviteData) {
          setError('Token de convite inválido ou expirado');
        } else {
          setInvite(inviteData);
          setStep('form');
        }
      } catch (err) {
        setError('Erro ao validar convite');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, getInviteByToken]);

  const validateForm = (): boolean => {
    const errors: Partial<OnboardingFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      errors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await acceptInvite(token, {
        name: formData.name.trim(),
        password: formData.password,
      });
      
      setStep('complete');
      toast.success('Conta criada com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof OnboardingFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'technician': return 'Técnico';
      case 'requester': return 'Solicitante';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'technician': return Zap;
      case 'requester': return User;
      default: return User;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse delay-75"></div>
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse delay-150"></div>
            </div>
            <p className="text-center text-muted-foreground mt-4">
              Validando convite...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>
              Não foi possível validar seu convite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/login')}
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/src/assets/images/traknor-logo.svg" 
                alt="TrakNor Logo" 
                className="h-8 w-8 text-primary" 
              />
              <h1 className="text-xl font-semibold">TrakNor CMMS</h1>
            </div>
            <Progress 
              value={step === 'form' ? 50 : step === 'complete' ? 100 : 25} 
              className="w-32" 
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-md">
        {step === 'form' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                {(() => {
                  const Icon = getRoleIcon(invite.role);
                  return <Icon className="w-6 h-6 text-primary" />;
                })()}
              </div>
              <CardTitle>Bem-vindo ao TrakNor!</CardTitle>
              <CardDescription>
                Você foi convidado como{' '}
                <span className="font-medium text-foreground">
                  {getRoleDisplayName(invite.role)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Email:</p>
                <p className="font-medium">{invite.email}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="Digite seu nome completo"
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                    aria-invalid={!!formErrors.name}
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && (
                    <p id="name-error" role="alert" className="text-sm text-destructive">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    placeholder="Crie uma senha segura"
                    aria-describedby={formErrors.password ? "password-error" : "password-help"}
                    aria-invalid={!!formErrors.password}
                    className={formErrors.password ? "border-destructive" : ""}
                  />
                  {formErrors.password ? (
                    <p id="password-error" role="alert" className="text-sm text-destructive">
                      {formErrors.password}
                    </p>
                  ) : (
                    <p id="password-help" className="text-xs text-muted-foreground">
                      Mínimo 8 caracteres, incluindo maiúscula, minúscula e número
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    placeholder="Digite a senha novamente"
                    aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
                    aria-invalid={!!formErrors.confirmPassword}
                    className={formErrors.confirmPassword ? "border-destructive" : ""}
                  />
                  {formErrors.confirmPassword && (
                    <p id="confirm-password-error" role="alert" className="text-sm text-destructive">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Conta Criada com Sucesso!</CardTitle>
              <CardDescription>
                Bem-vindo ao TrakNor CMMS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Sua conta foi criada e você já pode acessar o sistema.
                </p>
                <p className="text-sm">
                  <span className="font-medium">Função:</span>{' '}
                  {getRoleDisplayName(invite.role)}
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/')}
                >
                  Acessar Sistema
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/welcome-tour')}
                >
                  Fazer Tour Guiado
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}