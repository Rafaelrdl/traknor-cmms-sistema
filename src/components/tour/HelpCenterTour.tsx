import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Search, 
  BookOpen, 
  Star, 
  CheckCircle,
  Lightbulb 
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: any;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Centro de Ajuda!',
    description: 'Aqui você encontra tutoriais em vídeo, guias passo a passo e respostas para suas dúvidas sobre o TrakNor CMMS.',
    target: '[data-tour="welcome"]',
    position: 'bottom',
    icon: Lightbulb
  },
  {
    id: 'search',
    title: 'Pesquise por Conteúdo',
    description: 'Use a barra de pesquisa para encontrar rapidamente artigos, vídeos e guias específicos.',
    target: '[data-tour="search"]',
    position: 'bottom',
    icon: Search
  },
  {
    id: 'categories',
    title: 'Navegue por Categorias',
    description: 'Explore o conteúdo organizado por temas como Ativos, Ordens de Serviço, Manutenção Preventiva e muito mais.',
    target: '[data-tour="categories"]',
    position: 'top',
    icon: BookOpen
  },
  {
    id: 'featured',
    title: 'Conteúdo em Destaque',
    description: 'Comece pelos vídeos e guias mais importantes, selecionados especialmente para você.',
    target: '[data-tour="featured"]',
    position: 'top',
    icon: Star
  },
  {
    id: 'progress',
    title: 'Acompanhe seu Progresso',
    description: 'Marque conteúdos como concluídos e acompanhe seu progresso de aprendizado no sistema.',
    target: '[data-tour="progress"]',
    position: 'bottom',
    icon: CheckCircle
  }
];

interface HelpCenterTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function HelpCenterTour({ isOpen, onClose, onComplete }: HelpCenterTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tourPosition, setTourPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Add highlight to target element
        element.classList.add('tour-highlight');
        
        // Calculate position based on step position preference
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'bottom':
            top = rect.bottom + scrollY + 10;
            left = rect.left + scrollX + (rect.width / 2);
            break;
          case 'top':
            top = rect.top + scrollY - 10;
            left = rect.left + scrollX + (rect.width / 2);
            break;
          case 'left':
            top = rect.top + scrollY + (rect.height / 2);
            left = rect.left + scrollX - 10;
            break;
          case 'right':
            top = rect.top + scrollY + (rect.height / 2);
            left = rect.right + scrollX + 10;
            break;
        }

        setTourPosition({ top, left });

        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    };

    updatePosition();
    
    // Update position on window resize/scroll
    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      
      // Remove highlight from all elements
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [isOpen, currentStep]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={skipTour}
      />

      {/* Tour Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed z-[60] max-w-sm"
          style={{
            top: tourPosition.top,
            left: tourPosition.left,
            transform: step.position === 'top' ? 'translate(-50%, -100%)' : 
                      step.position === 'bottom' ? 'translate(-50%, 0)' :
                      step.position === 'left' ? 'translate(-100%, -50%)' :
                      'translate(0, -50%)'
          }}
        >
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {currentStep + 1} de {tourSteps.length}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-base">
                {step.description}
              </CardDescription>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={nextStep}
                  className="flex items-center gap-1"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Concluir
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>

              {currentStep === 0 && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    className="text-muted-foreground"
                  >
                    Pular tour
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arrow pointing to target */}
          <div
            className={`absolute w-3 h-3 bg-background border transform rotate-45 ${
              step.position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 border-r-0 border-b-0' :
              step.position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-l-0 border-t-0' :
              step.position === 'right' ? 'top-1/2 -left-1.5 -translate-y-1/2 border-r-0 border-t-0' :
              'top-1/2 -right-1.5 -translate-y-1/2 border-l-0 border-b-0'
            }`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Quick start guide - shown on first step */}
      {currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 z-[60] max-w-xs"
        >
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="h-4 w-4" />
                Início Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Assista ao vídeo de introdução</p>
              <p>• Explore as categorias de conteúdo</p>
              <p>• Marque artigos como favoritos</p>
              <p>• Acompanhe seu progresso</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}

// CSS styles to be added to global CSS
export const tourStyles = `
  .tour-highlight {
    position: relative;
    z-index: 51;
  }
  
  .tour-highlight::before {
    content: '';
    position: absolute;
    inset: -4px;
    background: rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    pointer-events: none;
    animation: tour-pulse 2s ease-in-out infinite;
  }
  
  @keyframes tour-pulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.02);
    }
  }
`;

// Hook for managing tour state
export function useHelpCenterTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('help:tour-seen');
    if (seen === 'true') {
      setHasSeenTour(true);
    }
  }, []);

  const startTour = () => {
    setIsOpen(true);
  };

  const closeTour = () => {
    setIsOpen(false);
  };

  const completeTour = () => {
    setHasSeenTour(true);
    localStorage.setItem('help:tour-seen', 'true');
    setIsOpen(false);
  };

  const resetTour = () => {
    setHasSeenTour(false);
    localStorage.removeItem('help:tour-seen');
  };

  return {
    isOpen,
    hasSeenTour,
    startTour,
    closeTour,
    completeTour,
    resetTour
  };
}