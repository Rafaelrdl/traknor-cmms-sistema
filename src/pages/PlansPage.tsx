import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Edit, Eye } from 'lucide-react';
import { PlanFormModal } from '@/components/PlanFormModal';
import { useMaintenancePlansNew, updatePlanInList } from '@/hooks/useMaintenancePlans';
import type { MaintenancePlan } from '@/models/plan';

export function PlansPage() {
  const [plans, setPlans] = useMaintenancePlansNew();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | undefined>();

  const handleNewPlan = () => {
    setSelectedPlan(undefined);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: MaintenancePlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handlePlanSave = (savedPlan: MaintenancePlan) => {
    if (selectedPlan) {
      // Update existing plan in list
      setPlans(currentPlans => updatePlanInList(currentPlans, savedPlan));
    } else {
      // Add new plan to list
      setPlans(currentPlans => [...currentPlans, savedPlan]);
    }
  };

  const getScopeDisplay = (plan: MaintenancePlan) => {
    const { scope } = plan;
    if (!scope) return 'Geral';
    
    const parts = [];
    if (scope.location_name) parts.push(scope.location_name);
    if (scope.equipment_name) parts.push(scope.equipment_name);
    
    return parts.length > 0 ? parts.join(' / ') : 'Geral';
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Planos de Manutenção" 
        description="Planejamento de manutenções preventivas"
      >
        <Button onClick={handleNewPlan} className="flex items-center gap-2">
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
          <Table role="grid">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Nome do Plano</TableHead>
                <TableHead scope="col">Frequência</TableHead>
                <TableHead scope="col">Escopo</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center space-y-2">
                      <Calendar className="h-8 w-8 opacity-50" />
                      <span>Nenhum plano de manutenção cadastrado.</span>
                      <Button
                        variant="outline"
                        onClick={handleNewPlan}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Plano
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        {plan.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs" title={plan.description}>
                            {plan.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {plan.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>{getScopeDisplay(plan)}</TableCell>
                    <TableCell>
                      <Badge variant={plan.status === 'Ativo' ? "default" : "secondary"}>
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                        className="flex items-center gap-1"
                        aria-label={`Editar plano ${plan.name}`}
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PlanFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        plan={selectedPlan}
        onSave={handlePlanSave}
      />
    </div>
  );
}