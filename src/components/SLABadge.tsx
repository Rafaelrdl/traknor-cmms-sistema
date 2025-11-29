/**
 * SLABadge - Badge indicador de status de SLA
 * 
 * Exibe o status do SLA com cores e ícones indicativos.
 */

import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { formatTimeRemaining } from '@/store/useSLAStore';

type SLAStatus = 'on-time' | 'warning' | 'breached' | 'completed';

interface SLABadgeProps {
  status: SLAStatus;
  timeRemaining: number; // em minutos
  percentage: number;
  type: 'response' | 'resolution';
  className?: string;
}

const statusConfig = {
  'on-time': {
    icon: Clock,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    label: 'No prazo',
  },
  'warning': {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    label: 'Atenção',
  },
  'breached': {
    icon: XCircle,
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
    label: 'Atrasado',
  },
  'completed': {
    icon: CheckCircle2,
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    label: 'Concluído',
  },
};

export function SLABadge({ status, timeRemaining, percentage, type, className }: SLABadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const typeLabel = type === 'response' ? 'Atendimento' : 'Fechamento';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
              config.bgColor,
              config.textColor,
              config.borderColor,
              className
            )}
          >
            <Icon className="h-3 w-3" />
            <span>{formatTimeRemaining(timeRemaining)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">SLA de {typeLabel}</p>
            <p className="text-xs">{config.label}</p>
            {status !== 'completed' && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progresso</span>
                  <span>{Math.round(percentage)}%</span>
                </div>
                <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      status === 'breached' ? 'bg-red-500' :
                      status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    )}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Componente simplificado para exibir na lista compacta
 */
export function SLAIndicator({ status }: { status: SLAStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center justify-center w-5 h-5 rounded-full',
              config.bgColor
            )}
          >
            <Icon className={cn('h-3 w-3', config.textColor)} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
