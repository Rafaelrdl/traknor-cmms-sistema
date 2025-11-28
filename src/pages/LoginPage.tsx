import { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login as loginService } from '@/services/authService';

export function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.data) {
      const data: any = error.response.data;
      if (typeof data.detail === 'string') return data.detail;
      if (typeof data.error === 'string') return data.error;
      
      const emailError = Array.isArray(data.username_or_email) ? data.username_or_email[0] : null;
      const passwordError = Array.isArray(data.password) ? data.password[0] : null;
      
      if (typeof emailError === 'string') return emailError;
      if (typeof passwordError === 'string') return passwordError;
    }
    
    return 'Erro ao fazer login. Verifique suas credenciais.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await loginService(formData.email, formData.password);
      toast.success('Login realizado com sucesso!');
      
      // Forçar redirecionamento com window.location para garantir a navegação
      setTimeout(() => {
        window.location.href = '/';
      }, 300);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-primary">TRAKNOR</h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestão de Manutenção</p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Acesse a plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@empresa.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-12 ${errors.email ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <div id="email-error" role="alert" className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`h-12 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <div id="password-error" role="alert" className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Acessar'}
                </Button>

                {/* Demo Credentials */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Credenciais de demonstração:</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Admin: admin@umc.com / admin123</div>
                    <div>Técnico: tecnico@umc.com / tecnico123</div>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                  >
                    Problemas de acesso? Fale conosco
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - HVAC Background Image */}
      <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
              <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <rect width="400" height="300" fill="url(#bg)"/>
                
                <!-- HVAC Pipes -->
                <g stroke="#64748b" stroke-width="3" fill="none" opacity="0.6">
                  <!-- Horizontal pipes -->
                  <line x1="50" y1="80" x2="350" y2="80"/>
                  <line x1="50" y1="120" x2="350" y2="120"/>
                  <line x1="50" y1="160" x2="350" y2="160"/>
                  <line x1="50" y1="200" x2="350" y2="200"/>
                  
                  <!-- Vertical pipes -->
                  <line x1="100" y1="60" x2="100" y2="220"/>
                  <line x1="150" y1="60" x2="150" y2="220"/>
                  <line x1="250" y1="60" x2="250" y2="220"/>
                  <line x1="300" y1="60" x2="300" y2="220"/>
                  
                  <!-- Joints -->
                  <circle cx="100" cy="80" r="4" fill="#64748b"/>
                  <circle cx="150" cy="120" r="4" fill="#64748b"/>
                  <circle cx="250" cy="160" r="4" fill="#64748b"/>
                  <circle cx="300" cy="200" r="4" fill="#64748b"/>
                </g>
                
                <!-- Equipment boxes -->
                <g fill="#94a3b8" opacity="0.4">
                  <rect x="320" y="100" width="60" height="40" rx="4"/>
                  <rect x="320" y="180" width="60" height="40" rx="4"/>
                  <rect x="20" y="140" width="40" height="60" rx="4"/>
                </g>
                
                <!-- Dashboard mockup -->
                <g transform="translate(180, 240)">
                  <rect x="0" y="0" width="120" height="80" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
                  <rect x="10" y="10" width="100" height="8" rx="4" fill="#e2e8f0"/>
                  <rect x="10" y="25" width="80" height="6" rx="3" fill="#cbd5e1"/>
                  <rect x="10" y="35" width="60" height="6" rx="3" fill="#cbd5e1"/>
                  <circle cx="85" cy="55" r="15" fill="none" stroke="#0ea5e9" stroke-width="2"/>
                  <path d="M 75 55 A 10 10 0 0 1 85 45" stroke="#06b6d4" stroke-width="3" fill="none"/>
                </g>
              </svg>
            `)}`
          }}
        />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-primary">
                Gestão Inteligente de HVAC
              </h2>
              <p className="text-lg text-muted-foreground">
                Monitore, mantenha e otimize seus sistemas de climatização com eficiência total.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-left">
                <div className="font-semibold text-primary mb-1">Manutenção Preventiva</div>
                <div className="text-muted-foreground">Agendamento automático e controle de execução</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-left">
                <div className="font-semibold text-primary mb-1">Relatórios PMOC</div>
                <div className="text-muted-foreground">Conformidade total com as normas brasileiras</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
