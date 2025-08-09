import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { MaintenancePlan, PlanTask } from '@/models/plan';
import { createPlan, updatePlan } from '@/data/plansStore';
import { useCompanies, useSectors, useEquipment } from '@/hooks/useDataTemp';

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: MaintenancePlan;
  onSave: (plan: MaintenancePlan) => void;
}

export function PlanFormModal({ open, onOpenChange, plan, onSave }: PlanFormModalProps) {
  const [companies] = useCompanies();
  const [sectors] = useSectors();
  const [equipment] = useEquipment();

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    frequency: MaintenancePlan['frequency'] | '';
    scope: {
      location_id: string;
      location_name: string;
      equipment_id: string;
      equipment_name: string;
    };
    tasks: PlanTask[];
    status: MaintenancePlan['status'];
    start_date: string;
  }>({
    name: '',
    description: '',
    frequency: '',
    scope: {
      location_id: '',
      location_name: '',
      equipment_id: '',
      equipment_name: ''
    },
    tasks: [],
    status: 'Ativo',
    start_date: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load plan data when editing
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || '',
        frequency: plan.frequency,
        scope: plan.scope || {
          location_id: '',
          location_name: '',
          equipment_id: '',
          equipment_name: ''
        },
        tasks: plan.tasks || [],
        status: plan.status,
        start_date: plan.start_date || ''
      });
    } else {
      // Reset form for new plan
      setFormData({
        name: '',
        description: '',
        frequency: '',
        scope: {
          location_id: '',
          location_name: '',
          equipment_id: '',
          equipment_name: ''
        },
        tasks: [],
        status: 'Ativo',
        start_date: ''
      });
    }
    setErrors({});
  }, [plan, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Frequência é obrigatória';
    }

    // Validate tasks
    formData.tasks.forEach((task, index) => {
      if (!task.name.trim()) {
        newErrors[`task-${index}`] = 'Nome da tarefa é obrigatório';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros do formulário');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let savedPlan: MaintenancePlan;
      
      if (plan) {
        // Update existing plan
        savedPlan = updatePlan({
          ...plan,
          name: formData.name,
          description: formData.description,
          frequency: formData.frequency as MaintenancePlan['frequency'],
          scope: formData.scope,
          tasks: formData.tasks,
          status: formData.status,
          start_date: formData.start_date
        });
        toast.success('Plano atualizado com sucesso.');
      } else {
        // Create new plan
        savedPlan = createPlan({
          name: formData.name,
          description: formData.description,
          frequency: formData.frequency as MaintenancePlan['frequency'],
          scope: formData.scope,
          tasks: formData.tasks,
          status: formData.status,
          start_date: formData.start_date
        });
        toast.success('Plano criado com sucesso.');
      }
      
      onSave(savedPlan);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Erro ao salvar plano.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = (locationId: string) => {
    if (locationId === "no-location") {
      setFormData(prev => ({
        ...prev,
        scope: {
          ...prev.scope,
          location_id: '',
          location_name: ''
        }
      }));
      return;
    }

    const company = companies.find(c => c.id === locationId);
    const sector = sectors.find(s => s.id === locationId);
    
    let locationName = '';
    if (company) {
      locationName = company.name;
    } else if (sector) {
      locationName = sector.name;
    }

    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        location_id: locationId,
        location_name: locationName
      }
    }));
  };

  const handleEquipmentChange = (equipmentId: string) => {
    if (equipmentId === "no-equipment") {
      setFormData(prev => ({
        ...prev,
        scope: {
          ...prev.scope,
          equipment_id: '',
          equipment_name: ''
        }
      }));
      return;
    }

    const selectedEquipment = equipment.find(eq => eq.id === equipmentId);
    
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        equipment_id: equipmentId,
        equipment_name: selectedEquipment?.tag || ''
      }
    }));
  };

  const addTask = () => {
    const newTask: PlanTask = {
      id: `task-${Date.now()}`,
      name: '',
      checklist: []
    };
    
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const updateTask = (index: number, updates: Partial<PlanTask>) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === index ? { ...task, ...updates } : task
      )
    }));
  };

  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const addChecklistItem = (taskIndex: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex 
          ? { 
              ...task, 
              checklist: [...(task.checklist || []), ''] 
            }
          : task
      )
    }));
  };

  const updateChecklistItem = (taskIndex: number, itemIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex 
          ? { 
              ...task, 
              checklist: (task.checklist || []).map((item, j) => 
                j === itemIndex ? value : item
              ) 
            }
          : task
      )
    }));
  };

  const removeChecklistItem = (taskIndex: number, itemIndex: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex 
          ? { 
              ...task, 
              checklist: (task.checklist || []).filter((_, j) => j !== itemIndex)
            }
          : task
      )
    }));
  };

  const isEditing = !!plan;
  const modalTitle = isEditing ? 'Editar Plano de Manutenção' : 'Novo Plano de Manutenção';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold focus:outline-none" tabIndex={-1}>
            {modalTitle}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Plano Mensal - Climatizadores"
                className={errors.name ? 'border-red-500' : ''}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600">
                  {errors.name}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência *</Label>
              <Select
                value={formData.frequency || undefined}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  frequency: value as MaintenancePlan['frequency']
                }))}
              >
                <SelectTrigger className={errors.frequency ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                  <SelectItem value="Bimestral">Bimestral</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Semestral">Semestral</SelectItem>
                  <SelectItem value="Anual">Anual</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p className="text-sm text-red-600">
                  {errors.frequency}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição detalhada do plano de manutenção"
              rows={3}
            />
          </div>

          {/* Scope Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Escopo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localização (Opcional)</Label>
                <Select
                  value={formData.scope.location_id || "no-location"}
                  onValueChange={handleLocationChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-location">Nenhuma selecionada</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Equipamento (Opcional)</Label>
                <Select
                  value={formData.scope.equipment_id || "no-equipment"}
                  onValueChange={handleEquipmentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-equipment">Nenhum selecionado</SelectItem>
                    {equipment.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.tag} - {eq.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  status: value as MaintenancePlan['status']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-date">Data de Início (Opcional)</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          {/* Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Tarefas</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTask}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Tarefa
              </Button>
            </div>

            {formData.tasks.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center text-muted-foreground">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma tarefa definida</p>
                    <p className="text-sm">Clique em "Adicionar Tarefa" para começar</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.tasks.map((task, taskIndex) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Tarefa {taskIndex + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(taskIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Remover tarefa ${taskIndex + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`task-name-${taskIndex}`}>Nome da Tarefa *</Label>
                    <Input
                      id={`task-name-${taskIndex}`}
                      value={task.name}
                      onChange={(e) => updateTask(taskIndex, { name: e.target.value })}
                      placeholder="Ex: Limpeza de filtros"
                      className={errors[`task-${taskIndex}`] ? 'border-red-500' : ''}
                    />
                    {errors[`task-${taskIndex}`] && (
                      <p className="text-sm text-red-600">
                        {errors[`task-${taskIndex}`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Checklist (Opcional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addChecklistItem(taskIndex)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar Item
                      </Button>
                    </div>
                    
                    {task.checklist && task.checklist.length > 0 && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        {task.checklist.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => updateChecklistItem(taskIndex, itemIndex, e.target.value)}
                              placeholder="Item do checklist"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChecklistItem(taskIndex, itemIndex)}
                              className="text-red-600 hover:text-red-700"
                              aria-label={`Remover item ${itemIndex + 1} do checklist`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </form>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="min-w-[120px]"
          >
            {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}