import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  Wrench,
  ClipboardList,
  MessageSquare,
  Calendar,
  TrendingUp,
  Package,
  FileText,
  Download,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useCurrentRole } from '@/data/authStore';
import type { UserRole } from '@/models/user';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  route?: string;
  roles?: UserRole[];
}

const tourSteps: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Visão Geral',
    description: 'Acompanhe métricas e indicadores em tempo real',
    icon: BarChart3,
    features: [
      'KPIs de manutenção em tempo real',
      'Gráficos de evolução de OS',
      'Status dos ativos',
      'Próximas manutenções programadas'
    ],
    route: '/',
    roles: ['admin', 'technician', 'requester']
  },
  {
    id: 'assets',
    title: 'Ativos',
    description: 'Gerencie equipamentos e suas localizações',
    icon: Wrench,
    features: [
      'Cadastro hierárquico de locais',
      'Registro de equipamentos HVAC',
      'Histórico de manutenções',
      'Documentação técnica'
    ],
    route: '/ativos',
    roles: ['admin', 'technician']
  },
  {
    id: 'work-orders',
    title: 'Ordens de Serviço',
    description: 'Execute manutenções preventivas e corretivas',
    icon: ClipboardList,
    features: [
      'Múltiplas visualizações (Lista, Kanban, Painel)',
      'Checklists dinâmicos',
      'Upload de fotos e evidências',
      'Controle de status e prioridades'
    ],
    route: '/work-orders',
    roles: ['admin', 'technician']
  },
  {
    id: 'requests',
    title: 'Solicitações',
    description: 'Gerencie solicitações de manutenção',
    icon: MessageSquare,
    features: [
      'Fluxo de aprovação estruturado',
      'Conversão automática em OS',
      'Histórico de status',
      'Controle de itens de estoque'
    ],
    route: '/requests',
    roles: ['admin', 'technician', 'requester']
  },
  {
    id: 'plans',
    title: 'Planos de Manutenção',
    description: 'Configure manutenções preventivas automatizadas',
    icon: Calendar,
    features: [
      'Criação de planos por frequência',
      'Templates de checklist',
      'Programação automática',
      'Vinculação a equipamentos específicos'
    ],
    route: '/plans',
    roles: ['admin', 'technician']
  },
  {
    id: 'metrics',
    title: 'Métricas',
    description: 'Analise performance e indicadores detalhados',
    icon: TrendingUp,
    features: [
      'MTTR e MTBF por setor',
      'Análise de backlog',
      'Performance por técnico',
      'Exportação de relatórios'
    ],
    route: '/metrics',
    roles: ['admin', 'technician']
  },
  {
    id: 'inventory',
    title: 'Estoque',
    description: 'Controle materiais e movimentações',
    icon: Package,
    features: [
      'Múltiplas visualizações (Tabela, Cards, Análise)',
      'Alertas de reposição',
      'Movimentações de entrada/saída',
      'Análise de consumo por categoria'
    ],
    route: '/inventory',
    roles: ['admin', 'technician']
  },
  {
    id: 'procedures',
    title: 'Procedimentos',
    description: 'Acesse documentação técnica e procedimentos',
    icon: FileText,
    features: [
      'Upload de PDFs e Markdown',
      'Visualização inline com zoom',
      'Categorização e filtros',
      'Controle de versões'
    ],
    route: '/procedures',
    roles: ['admin', 'technician', 'requester']
  },
  {
    id: 'reports',
    title: 'Relatórios',
    description: 'Gere relatórios PMOC e personalizados',
    icon: Download,
    features: [
      'Relatórios PMOC automáticos',
      'Filtros por período e local',
      'Exportação PDF/CSV',
      'Histórico de relatórios'
    ],
    route: '/reports',
    roles: ['admin', 'technician']
  }
];

export function WelcomeTourPage() {
  const navigate = useNavigate();
  const [currentRole] = useCurrentRole();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Filter steps based on user role
  const availableSteps = tourSteps.filter(step => 
    !step.roles || step.roles.includes(currentRole)
  );

  const progress = ((currentStep + 1) / availableSteps.length) * 100;
  const isLastStep = currentStep === availableSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    // Mark current step as completed when user spends some time on it
    const timer = setTimeout(() => {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleFinishTour();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGoToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleVisitPage = () => {
    const step = availableSteps[currentStep];
    if (step.route) {
      navigate(step.route);
    }
  };

  const handleFinishTour = () => {
    // Mark tour as completed in localStorage
    localStorage.setItem('onboarding:tourCompleted', 'true');
    navigate('/');
  };

  const handleSkipTour = () => {
    localStorage.setItem('onboarding:tourCompleted', 'true');
    navigate('/');
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'technician': return 'Técnico';
      case 'requester': return 'Solicitante';
      default: return role;
    }
  };

  const currentStepData = availableSteps[currentStep];

  if (!currentStepData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Tour de Boas-vindas</h1>
                <p className="text-sm text-muted-foreground">
                  Perfil: {getRoleDisplayName(currentRole)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Progress value={progress} className="w-32" />
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} de {availableSteps.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <currentStepData.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                      <CardDescription className="text-base">
                        {currentStepData.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Principais funcionalidades:</h3>
                      <ul className="space-y-2">
                        {currentStepData.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {currentStepData.route && (
                      <div className="pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={handleVisitPage}
                          className="w-full sm:w-auto"
                        >
                          Visitar Página
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Progresso do Tour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = completedSteps.has(index);
                      const isCurrent = index === currentStep;
                      
                      return (
                        <button
                          key={step.id}
                          onClick={() => handleGoToStep(index)}
                          className={`
                            w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors
                            ${isCurrent 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                            }
                          `}
                        >
                          <div className={`
                            w-8 h-8 rounded-md flex items-center justify-center
                            ${isCurrent 
                              ? 'bg-primary-foreground/20' 
                              : isCompleted 
                                ? 'bg-green-100' 
                                : 'bg-muted'
                            }
                          `}>
                            {isCompleted && !isCurrent ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Icon className={`w-4 h-4 ${
                                isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isCurrent ? 'text-primary-foreground' : ''
                            }`}>
                              {step.title}
                            </p>
                            {isCompleted && !isCurrent && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                Concluído
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Você pode pular o tour a qualquer momento
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSkipTour}
                      className="w-full"
                    >
                      Pular Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            <div className="flex items-center space-x-2">
              {availableSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleGoToStep(index)}
                  className={`
                    w-2 h-2 rounded-full transition-colors
                    ${index === currentStep ? 'bg-primary' : 'bg-muted'}
                  `}
                  aria-label={`Ir para etapa ${index + 1}`}
                />
              ))}
            </div>

            <Button 
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Finalizar Tour' : 'Próximo'}</span>
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}