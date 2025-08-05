import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}


const variantStyles = {
  default: '',
  success: 'border-[hsl(var(--success))] bg-[hsl(var(--success)/0.05)]',
  warning: 'border-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.05)]',
  danger: 'border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.05)]'
};

const trendIcons = {
  up: <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />, 
  down: <TrendingDown className="h-4 w-4 text-[hsl(var(--destructive))]" />, 
  neutral: <Minus className="h-4 w-4 text-muted-foreground" />
};

export function KPICard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon,
  variant = 'default' 
}: KPICardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md border",
      variantStyles[variant]
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {trend && trendValue && (
          <div className="flex items-center text-xs text-muted-foreground">
            {trendIcons[trend]}
            <span className="ml-1">{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}