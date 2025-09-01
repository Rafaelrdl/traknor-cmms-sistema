import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Edit, Play, CheckCircle } from 'lucide-react';
import { PlanFormModal } from '@/components/PlanFormModal';
import { useMaintenancePlansNew, updatePlanInList } from '@/hooks/useMaintenancePlans';
import { IfCanCreate, IfCanEdit } from '@/components/auth/IfCan';
import { generateWorkOrdersFromPlan } from '@/data/workOrdersStore';
import { updatePlanNextExecution } from '@/data/plansStore';
import { toast } from 'sonner';
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

  const handleGenerateWorkOrders = async (plan: MaintenancePlan) => {
    try {
      if (!plan.scope.equipment_ids || plan.scope.equipment_ids.length === 0) {
        toast.error('Este plano não possui equipamentos selecionados.');
        return;
      }

      const workOrders = generateWorkOrdersFromPlan(plan);
      
      // Update plan's next execution date
      const updatedPlan = updatePlanNextExecution(plan.id);
      if (updatedPlan) {
        setPlans(currentPlans => updatePlanInList(currentPlans, updatedPlan));
      }

      toast.success(`${workOrders.length} ordem(ns) de serviço gerada(s) com sucesso!`, {
        description: `Próxima execução programada para ${updatedPlan?.next_execution_date ? new Date(updatedPlan.next_execution_date).toLocaleDateString('pt-BR') : 'data não definida'}`
      });
    } catch (error) {
      console.error('Error generating work orders:', error);
      toast.error('Erro ao gerar ordens de serviço: ' + (error as Error).message);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const getScopeDisplay = (plan: MaintenancePlan) => {
    const { scope } = plan;
    if (!scope) return 'Geral';
    
    const parts = [];
    if (scope.location_name) parts.push(scope.location_name);
    if (scope.equipment_names && scope.equipment_names.length > 0) {
      if (scope.equipment_names.length === 1) {
        parts.push(scope.equipment_names[0]);
      } else {
        parts.push(`${scope.equipment_names.length} equipamentos`);
      }
    }
    
    return parts.length > 0 ? parts.join(' / ') : 'Geral';
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Planos de Manutenção" 
        description="Planejamento de manutenções preventivas"
      >
        <IfCanCreate subject="plan">
          <Button onClick={handleNewPlan} className="flex items-center gap-2" data-testid="plan-create">
            <Plus className="h-4 w-4" />
            Novo Plano
          </Button>
        </IfCanCreate>
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
                <TableHead scope="col">Próxima Execução</TableHead>
                <TableHead scope="col">Geração Automática</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center space-y-2">
                      <Calendar className="h-8 w-8 opacity-50" />
                      <span>Nenhum plano de manutenção cadastrado.</span>
                      <IfCanCreate subject="plan">
                        <Button
                          variant="outline"
                          onClick={handleNewPlan}
                          className="mt-2"
                          data-testid="plan-create-empty"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Plano
                        </Button>
                      </IfCanCreate>
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
                    <TableCell>
                      <div className="space-y-1">
                        <div>{getScopeDisplay(plan)}</div>
                        {plan.scope.equipment_names && plan.scope.equipment_names.length > 1 && (
                          <div className="text-xs text-muted-foreground">
                            {plan.scope.equipment_names.slice(0, 2).join(', ')}
                            {plan.scope.equipment_names.length > 2 && ` +${plan.scope.equipment_names.length - 2}`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(plan.next_execution_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.auto_generate ? "default" : "secondary"}>
                        {plan.auto_generate ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : null}
                        {plan.auto_generate ? 'Ativa' : 'Manual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.status === 'Ativo' ? "default" : "secondary"}>
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IfCanEdit subject="plan">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                            className="flex items-center gap-1"
                            aria-label={`Editar plano ${plan.name}`}
                            data-testid="plan-edit"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                        </IfCanEdit>
                        
                        {plan.status === 'Ativo' && plan.scope.equipment_ids && plan.scope.equipment_ids.length > 0 && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleGenerateWorkOrders(plan)}
                            className="flex items-center gap-1"
                            aria-label={`Gerar ordens de serviço para ${plan.name}`}
                            data-testid="plan-generate"
                          >
                            <Play className="h-3 w-3" />
                            Gerar OS
                          </Button>
                        )}
                      </div>
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