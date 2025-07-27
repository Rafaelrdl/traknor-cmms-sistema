import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { useMaintenancePlans } from '@/hooks/useData';

export function PlansPage() {
  const [plans] = useMaintenancePlans();

  const frequencyLabels = {
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral', 
    SEMI_ANNUAL: 'Semestral',
    ANNUAL: 'Anual'
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Planos de Manutenção" 
        description="Planejamento de manutenções preventivas"
      >
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Plano
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {frequencyLabels[plan.frequency]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}