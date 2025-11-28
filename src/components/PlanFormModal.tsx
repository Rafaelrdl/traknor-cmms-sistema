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
import { useCompanies, useSectors } from '@/hooks/useLocationsQuery';
import { useEquipments } from '@/hooks/useEquipmentQuery';

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: MaintenancePlan;
  onSave: (plan: MaintenancePlan) => void;
}

export function PlanFormModal({ open, onOpenChange, plan, onSave }: PlanFormModalProps) {
  const { data: companies = [] } = useCompanies();
  const { data: sectors = [] } = useSectors();
  const { data: equipment = [] } = useEquipments();

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    frequency: MaintenancePlan['frequency'] | '';
    scope: {
      location_id: string;
      location_name: string;
      equipment_ids: string[];
      equipment_names: string[];
    };
    tasks: PlanTask[];
    status: MaintenancePlan['status'];
    start_date: string;
    auto_generate: boolean;
  }>({
    name: '',
    description: '',
    frequency: '',
    scope: {
      location_id: '',
      location_name: '',
      equipment_ids: [],
      equipment_names: []
    },
    tasks: [],
    status: 'Ativo',
    start_date: '',
    auto_generate: false
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
        scope: {
          location_id: plan.scope?.location_id || '',
          location_name: plan.scope?.location_name || '',
          equipment_ids: plan.scope?.equipment_ids || [],
          equipment_names: plan.scope?.equipment_names || []
        },
        tasks: plan.tasks || [],
        status: plan.status,
        start_date: plan.start_date || '',
        auto_generate: plan.auto_generate || false
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
          equipment_ids: [],
          equipment_names: []
        },
        tasks: [],
        status: 'Ativo',
        start_date: '',
        auto_generate: false
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

    // Validate location selection for equipment filtering
    if (!formData.scope.location_id) {
      newErrors.location = 'Selecione uma empresa ou setor antes de escolher equipamentos';
    }

    // Validate equipment selection
    if ((formData.scope.equipment_ids || []).length === 0) {
      if (!formData.scope.location_id) {
        newErrors.equipment = 'Primeiro selecione uma empresa ou setor';
      } else {
        newErrors.equipment = 'Pelo menos um equipamento deve ser selecionado';
      }
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
          start_date: formData.start_date,
          auto_generate: formData.auto_generate
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
          start_date: formData.start_date,
          auto_generate: formData.auto_generate
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
          location_name: '',
          // Clear selected equipment when location changes
          equipment_ids: [],
          equipment_names: []
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
        location_name: locationName,
        // Clear selected equipment when location changes
        equipment_ids: [],
        equipment_names: []
      }
    }));
  };

  const handleEquipmentChange = (equipmentId: string) => {
    const selectedEquipment = equipment.find(eq => eq.id === equipmentId);
    if (!selectedEquipment) return;

    setFormData(prev => {
      // Ensure equipment_ids is always an array
      const currentEquipmentIds = prev.scope.equipment_ids || [];
      const currentEquipmentNames = prev.scope.equipment_names || [];
      
      const isAlreadySelected = currentEquipmentIds.includes(equipmentId);
      
      if (isAlreadySelected) {
        // Remove equipment
        const newIds = currentEquipmentIds.filter(id => id !== equipmentId);
        const newNames = currentEquipmentNames.filter((_, index) => 
          currentEquipmentIds[index] !== equipmentId
        );
        
        return {
          ...prev,
          scope: {
            ...prev.scope,
            equipment_ids: newIds,
            equipment_names: newNames
          }
        };
      } else {
        // Add equipment
        return {
          ...prev,
          scope: {
            ...prev.scope,
            equipment_ids: [...currentEquipmentIds, equipmentId],
            equipment_names: [...currentEquipmentNames, selectedEquipment.tag || selectedEquipment.model || `Equipment ${equipmentId}`]
          }
        };
      }
    });
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        equipment_ids: (prev.scope.equipment_ids || []).filter((_, i) => i !== index),
        equipment_names: (prev.scope.equipment_names || []).filter((_, i) => i !== index)
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

  // Filter equipment based on selected location (company or sector)
  const getFilteredEquipment = () => {
    if (!formData.scope.location_id) {
      // If no location selected, return empty array to force selection
      return [];
    }

    // Check if selected location is a company
    const selectedCompany = companies.find(c => c.id === formData.scope.location_id);
    if (selectedCompany) {
      // Get all sectors for this company
      const companySectors = sectors.filter(s => s.companyId === selectedCompany.id);
      const sectorIds = companySectors.map(s => s.id);
      
      // Return equipment that belongs to any sector of this company
      return equipment.filter(eq => eq.sectorId && sectorIds.includes(eq.sectorId));
    }

    // Check if selected location is a sector
    const selectedSector = sectors.find(s => s.id === formData.scope.location_id);
    if (selectedSector) {
      // Return equipment that belongs to this specific sector
      return equipment.filter(eq => eq.sectorId === selectedSector.id);
    }

    return [];
  };

  const isEditing = !!plan;
  const modalTitle = isEditing ? 'Editar Plano de Manutenção' : 'Novo Plano de Manutenção';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-7xl h-[95vh] max-h-[95vh] overflow-hidden flex flex-col p-0 sm:w-[95vw] lg:w-[90vw] xl:w-[85vw]">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-xl font-semibold focus:outline-none" tabIndex={-1}>
            {modalTitle}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-8">
            {/* Basic Information */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                    <p id="name-error" className="text-sm text-red-600" role="alert">
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
                    <p className="text-sm text-red-600" role="alert">
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
                  className="resize-none"
                />
              </div>
            </section>

            {/* Scope Configuration */}
            <section className="space-y-6">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Escopo
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Empresa/Localização *</Label>
                    <Select
                      value={formData.scope.location_id || "no-location"}
                      onValueChange={handleLocationChange}
                    >
                      <SelectTrigger className={`w-full ${errors.location ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Selecione uma empresa ou setor" />
                      </SelectTrigger>
                      <SelectContent className="max-w-[350px] lg:max-w-[500px]">
                        <SelectItem value="no-location">Nenhuma selecionada</SelectItem>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Empresas
                        </div>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            <div className="flex flex-col items-start min-w-0">
                              <span className="font-medium truncate">{company.name}</span>
                              <span className="text-xs text-muted-foreground truncate">{company.segment}</span>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t">
                          Setores
                        </div>
                        {sectors.map((sector) => {
                          const company = companies.find(c => c.id === sector.companyId);
                          return (
                            <SelectItem key={sector.id} value={sector.id}>
                              <div className="flex flex-col items-start min-w-0">
                                <span className="font-medium truncate">{sector.name}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {company?.name || 'Empresa não encontrada'}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.location && (
                      <p className="text-sm text-red-600" role="alert">
                        {errors.location}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Selecione uma empresa para ver todos os equipamentos ou um setor específico para filtrar
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Equipamentos *</Label>
                    <Select 
                      onValueChange={handleEquipmentChange}
                      disabled={!formData.scope.location_id}
                    >
                      <SelectTrigger className={`w-full ${errors.equipment ? 'border-red-500' : ''}`}>
                        <SelectValue 
                          placeholder={
                            !formData.scope.location_id 
                              ? "Primeiro selecione uma empresa" 
                              : getFilteredEquipment().length === 0
                                ? "Nenhum equipamento disponível para esta localização"
                                : "Selecione equipamentos para o plano"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent className="max-w-[450px] lg:max-w-[600px]">
                        {getFilteredEquipment().map((eq) => (
                          <SelectItem 
                            key={eq.id} 
                            value={eq.id}
                            disabled={(formData.scope.equipment_ids || []).includes(eq.id)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {(formData.scope.equipment_ids || []).includes(eq.id) && (
                                <span className="text-primary shrink-0">✓</span>
                              )}
                              <div className="flex flex-col items-start min-w-0">
                                <span className="block truncate font-medium">{eq.tag} - {eq.model}</span>
                                <span className="text-xs text-muted-foreground truncate">{eq.brand} | {eq.type}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                        {getFilteredEquipment().length === 0 && formData.scope.location_id && (
                          <SelectItem value="no-equipment" disabled>
                            <span className="text-muted-foreground italic">
                              Nenhum equipamento cadastrado para esta localização
                            </span>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.equipment && (
                      <p className="text-sm text-red-600" role="alert">
                        {errors.equipment}
                      </p>
                    )}
                    {!formData.scope.location_id && (
                      <p className="text-sm text-muted-foreground">
                        Selecione uma empresa ou setor para visualizar os equipamentos disponíveis
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Equipment Display - Full Width */}
              {(formData.scope.equipment_ids || []).length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Equipamentos Selecionados ({(formData.scope.equipment_ids || []).length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-md p-4 bg-muted/20">
                    {(formData.scope.equipment_ids || []).map((equipmentId, index) => {
                      const equipmentData = equipment.find(eq => eq.id === equipmentId);
                      const sectorData = sectors.find(s => s.id === equipmentData?.sectorId);
                      const companyData = companies.find(c => c.id === sectorData?.companyId);
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-background rounded-md px-4 py-3 border border-border">
                          <div className="flex-1 mr-3 min-w-0">
                            <span className="text-sm font-medium truncate block">{(formData.scope.equipment_names || [])[index]}</span>
                            {equipmentData && (
                              <span className="text-xs text-muted-foreground truncate block">
                                {equipmentData.brand} • {equipmentData.type} • {companyData?.name || sectorData?.name || 'Local não identificado'}
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEquipment(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0 h-8 w-8 p-0"
                            aria-label={`Remover ${(formData.scope.equipment_names || [])[index]}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  {formData.scope.location_id && (
                    <p className="text-xs text-muted-foreground">
                      Mostrando equipamentos de: <span className="font-medium">{formData.scope.location_name}</span>
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Status and Date */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Configurações Gerais
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                  <Label htmlFor="start-date">Data de Início *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className={!formData.start_date ? 'border-yellow-400' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define quando as ordens de serviço começarão a ser geradas
                  </p>
                </div>
                
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      id="auto-generate"
                      type="checkbox"
                      checked={formData.auto_generate}
                      onChange={(e) => setFormData(prev => ({ ...prev, auto_generate: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2"
                    />
                    <Label htmlFor="auto-generate" className="text-sm font-medium cursor-pointer">
                      Gerar ordens de serviço automaticamente
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    Quando ativado, as ordens de serviço serão criadas automaticamente nas datas programadas conforme a frequência definida
                  </p>
                </div>
              </div>
            </section>

            {/* Tasks Section */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-2">
                <h3 className="text-lg font-medium text-foreground">Tarefas</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTask}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Tarefa
                </Button>
              </div>

              {formData.tasks.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-muted-foreground max-w-md">
                      <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p className="text-base font-medium mb-1">Nenhuma tarefa definida</p>
                      <p className="text-sm">Clique em "Adicionar Tarefa" para começar a criar as atividades do plano</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {formData.tasks.map((task, taskIndex) => (
                  <Card key={task.id} className="border border-border">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="text-base font-semibold">
                          Tarefa {taskIndex + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(taskIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start sm:self-center"
                          aria-label={`Remover tarefa ${taskIndex + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-1 sm:hidden">Remover</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                          <p className="text-sm text-red-600" role="alert">
                            {errors[`task-${taskIndex}`]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <Label>Checklist (Opcional)</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addChecklistItem(taskIndex)}
                            className="flex items-center gap-1 w-full sm:w-auto"
                          >
                            <Plus className="h-3 w-3" />
                            Adicionar Item
                          </Button>
                        </div>
                        
                        {task.checklist && task.checklist.length > 0 && (
                          <div className="space-y-3 pl-4 border-l-2 border-muted bg-muted/20 rounded-r-lg py-3 pr-3">
                            {task.checklist.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto shrink-0"
                                  aria-label={`Remover item ${itemIndex + 1} do checklist`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span className="ml-1 sm:hidden">Remover Item</span>
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
            </section>
          </div>
        </form>

        <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full sm:w-auto min-w-[120px] order-1 sm:order-2"
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}