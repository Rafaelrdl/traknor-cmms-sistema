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
    bgColor: 'bg-primary',
    textColor: 'text-white',
    iconColor: 'text-white/90',
    borderColor: 'border-primary',
    label: 'No prazo',
    progressColor: 'bg-primary',
  },
  'warning': {
    icon: AlertTriangle,
    bgColor: 'bg-primary',
    textColor: 'text-white',
    iconColor: 'text-white/90',
    borderColor: 'border-primary',
    label: 'Atenção',
    progressColor: 'bg-primary',
  },
  'breached': {
    icon: XCircle,
    bgColor: 'bg-primary',
    textColor: 'text-white',
    iconColor: 'text-white/90',
    borderColor: 'border-primary',
    label: 'Atrasado',
    progressColor: 'bg-primary',
  },
  'completed': {
    icon: CheckCircle2,
    bgColor: 'bg-primary',
    textColor: 'text-white',
    iconColor: 'text-white/90',
    borderColor: 'border-primary',
    label: 'Concluído',
    progressColor: 'bg-primary',
  },
};

/**
 * Formata o tempo de forma mais compacta e legível
 */
function formatTimeCompact(minutes: number): { value: string; unit: string; isNegative: boolean } {
  const isNegative = minutes < 0;
  const absMinutes = Math.abs(minutes);
  
  if (absMinutes < 60) {
    return { value: String(absMinutes), unit: 'min', isNegative };
  }
  
  const hours = Math.floor(absMinutes / 60);
  const remainingMinutes = absMinutes % 60;
  
  if (hours < 24) {
    if (remainingMinutes === 0) {
      return { value: String(hours), unit: 'h', isNegative };
    }
    return { value: `${hours}h${remainingMinutes}`, unit: 'm', isNegative };
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return { value: String(days), unit: 'd', isNegative };
  }
  return { value: `${days}d${remainingHours}`, unit: 'h', isNegative };
}

export function SLABadge({ status, timeRemaining, percentage, type, className }: SLABadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const typeLabel = type === 'response' ? 'Atendimento' : 'Fechamento';
  const time = formatTimeCompact(timeRemaining);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all',
              'hover:shadow-sm cursor-default w-[100px] justify-center',
              config.bgColor,
              config.borderColor,
              className
            )}
          >
            <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', config.iconColor)} />
            <div className="flex items-baseline gap-0.5 min-w-[60px] justify-center">
              {time.isNegative && (
                <span className={cn('text-xs font-medium', config.textColor)}>-</span>
              )}
              <span className={cn('text-sm font-semibold tabular-nums', config.textColor)}>
                {time.value}
              </span>
              <span className={cn('text-xs font-medium', config.textColor)}>
                {time.unit}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className={cn('p-3', config.bgColor, config.borderColor, 'border')}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-white/90" />
              <span className="font-medium text-white">SLA de {typeLabel}</span>
            </div>
            <p className="text-sm text-white/90">{config.label}</p>
            {status !== 'completed' && (
              <div className="pt-1">
                <div className="flex justify-between text-xs text-white/80 mb-1.5">
                  <span>Progresso</span>
                  <span className="font-medium">{Math.round(percentage)}%</span>
                </div>
                <div className="w-36 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-white/80"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
                <p className="text-xs text-white/80 mt-1.5">
                  {time.isNegative ? 'Atrasado: ' : 'Restante: '}
                  <span className="font-medium text-white">{formatTimeRemaining(timeRemaining)}</span>
                </p>
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
              'inline-flex items-center justify-center w-6 h-6 rounded-full',
              config.bgColor,
              config.borderColor,
              'border'
            )}
          >
            <Icon className={cn('h-3.5 w-3.5', config.iconColor)} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
