import type { MaintenancePlan } from '@/models/plan';

const STORAGE_KEY = 'traknor-maintenance-plans';

// Mock plans for seeding
export const MOCK_PLANS: MaintenancePlan[] = [
  {
    id: 'plan-1',
    name: 'Plano Mensal - Climatizadores',
    description: 'Manutenção preventiva mensal para climatizadores centrais',
    frequency: 'Mensal',
    scope: {
      location_id: '1',
      location_name: 'Setor Administrativo'
    },
    tasks: [
      {
        id: 'task-1',
        name: 'Limpeza de filtros',
        checklist: ['Verificar estado dos filtros', 'Limpar ou substituir filtros', 'Registrar substituições']
      },
      {
        id: 'task-2',
        name: 'Verificação do sistema elétrico',
        checklist: ['Verificar conexões', 'Testar funcionamento dos controles', 'Verificar temperatura']
      }
    ],
    status: 'Ativo',
    start_date: '2024-01-01',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'plan-2',
    name: 'Plano Trimestral - Splits',
    description: 'Manutenção preventiva trimestral para aparelhos split',
    frequency: 'Trimestral',
    scope: {
      equipment_id: 'eq-1',
      equipment_name: 'Split LG 12.000 BTUs'
    },
    tasks: [
      {
        id: 'task-3',
        name: 'Manutenção completa do evaporador',
        checklist: ['Limpeza das serpentinas', 'Verificação do dreno', 'Teste de vazamentos']
      }
    ],
    status: 'Ativo',
    created_at: '2024-01-10T15:30:00Z',
    updated_at: '2024-01-10T15:30:00Z'
  },
  {
    id: 'plan-3',
    name: 'Plano Semestral - Chillers',
    description: 'Manutenção preventiva semestral para chillers industriais',
    frequency: 'Semestral',
    scope: {
      location_id: '2',
      location_name: 'Departamento de TI',
      equipment_id: 'eq-2',
      equipment_name: 'Chiller Industrial 500TR'
    },
    tasks: [
      {
        id: 'task-4',
        name: 'Inspeção geral do sistema',
        checklist: ['Verificar pressões', 'Analisar fluido refrigerante', 'Testar válvulas']
      },
      {
        id: 'task-5',
        name: 'Manutenção preventiva do compressor'
      }
    ],
    status: 'Inativo',
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-05T09:15:00Z'
  }
];

export const loadPlans = (): MaintenancePlan[] => {
  if (typeof window === 'undefined') return MOCK_PLANS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error loading plans from localStorage:', error);
  }
  
  // Save mock data to localStorage on first load
  savePlans(MOCK_PLANS);
  return MOCK_PLANS;
};

export const savePlans = (plans: MaintenancePlan[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error('Error saving plans to localStorage:', error);
  }
};

export const createPlan = (plan: Omit<MaintenancePlan, 'id' | 'created_at' | 'updated_at'>): MaintenancePlan => {
  const newPlan: MaintenancePlan = {
    ...plan,
    id: `plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  const plans = loadPlans();
  const updatedPlans = [...plans, newPlan];
  savePlans(updatedPlans);
  
  return newPlan;
};

export const updatePlan = (updatedPlan: MaintenancePlan): MaintenancePlan => {
  const plans = loadPlans();
  const index = plans.findIndex(plan => plan.id === updatedPlan.id);
  
  if (index === -1) {
    throw new Error(`Plan with id ${updatedPlan.id} not found`);
  }
  
  const planWithUpdatedDate = {
    ...updatedPlan,
    updated_at: new Date().toISOString()
  };
  
  plans[index] = planWithUpdatedDate;
  savePlans(plans);
  
  return planWithUpdatedDate;
};

export const findPlanById = (id: string): MaintenancePlan | undefined => {
  const plans = loadPlans();
  return plans.find(plan => plan.id === id);
};

export const deletePlan = (id: string): boolean => {
  const plans = loadPlans();
  const filteredPlans = plans.filter(plan => plan.id !== id);
  
  if (filteredPlans.length === plans.length) {
    return false; // Plan not found
  }
  
  savePlans(filteredPlans);
  return true;
};