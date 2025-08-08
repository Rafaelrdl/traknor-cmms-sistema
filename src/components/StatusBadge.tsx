import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const statusConfig = {
  // Work Order statuses
  OPEN: { label: 'Aberta', variant: 'secondary' as const },
  IN_PROGRESS: { label: 'Em Execução', variant: 'default' as const },
  COMPLETED: { label: 'Concluída', variant: 'outline' as const },
  
  // Equipment statuses
  FUNCTIONING: { label: 'Funcionando', variant: 'outline' as const },
  MAINTENANCE: { label: 'Em Manutenção', variant: 'secondary' as const },
  STOPPED: { label: 'Parado', variant: 'destructive' as const },
  
  // Priority levels
  LOW: { label: 'Baixa', variant: 'outline' as const },
  MEDIUM: { label: 'Média', variant: 'secondary' as const },
  HIGH: { label: 'Alta', variant: 'default' as const },
  CRITICAL: { label: 'Crítica', variant: 'destructive' as const },
  
  // Work Order types
  PREVENTIVE: { label: 'Preventiva', variant: 'outline' as const },
  CORRECTIVE: { label: 'Corretiva', variant: 'secondary' as const },
  
  // Solicitation statuses
  'Nova': { label: 'Nova', variant: 'secondary' as const },
  'Em triagem': { label: 'Em triagem', variant: 'default' as const },
  'Convertida em OS': { label: 'Convertida em OS', variant: 'outline' as const }
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig];
  const badgeVariant = variant || config?.variant || 'outline';
  const label = config?.label || status;

  return (
    <Badge 
      variant={badgeVariant}
      className={cn(className)}
    >
      {label}
    </Badge>
  );
}