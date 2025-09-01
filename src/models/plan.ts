export type PlanStatus = 'Ativo' | 'Inativo';

export interface PlanTask {
  id: string;            // uuid
  name: string;          // ex.: "Inspecionar filtros"
  checklist?: string[];  // itens opcionais do passo
}

export interface MaintenancePlan {
  id: string;                  // uuid
  name: string;                // "Preventiva Chiller Mensal"
  description?: string;
  frequency: 'Semanal' | 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual';
  scope: {
    location_id?: string;
    location_name?: string;
    equipment_ids: string[];    // Múltiplos equipamentos
    equipment_names: string[];  // Nomes dos equipamentos para exibição
  };
  tasks: PlanTask[];
  status: PlanStatus;
  start_date?: string;         // ISO
  next_execution_date?: string; // Próxima data de execução automática
  auto_generate: boolean;      // Se deve gerar OSs automaticamente
  created_at: string;          // ISO
  updated_at: string;          // ISO
}