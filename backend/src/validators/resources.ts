import { z } from 'zod';

// Maintenance Plan validation schemas
export const createPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY']),
  company_id: z.string().uuid('Invalid company ID'),
  sector_id: z.string().uuid('Invalid sector ID').optional(),
  equipment_ids: z.array(z.string().uuid()).min(1, 'At least one equipment is required'),
  tasks: z.array(z.object({
    name: z.string().min(1, 'Task name is required'),
    checklist: z.array(z.string()).optional(),
  })).min(1, 'At least one task is required'),
  auto_generate: z.boolean().default(true),
  start_date: z.string().datetime().optional(),
});

export const updatePlanSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY']).optional(),
  sector_id: z.string().uuid().optional(),
  equipment_ids: z.array(z.string().uuid()).optional(),
  tasks: z.array(z.object({
    name: z.string().min(1),
    checklist: z.array(z.string()).optional(),
  })).optional(),
  auto_generate: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  start_date: z.string().datetime().optional(),
});

// Work Order validation schemas
export const createWorkOrderSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  company_id: z.string().uuid('Invalid company ID'),
  sector_id: z.string().uuid('Invalid sector ID').optional(),
  equipment_ids: z.array(z.string().uuid()).min(1, 'At least one equipment is required'),
  assigned_to: z.string().uuid('Invalid assignee ID').optional(),
  scheduled_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  tasks: z.array(z.object({
    name: z.string().min(1, 'Task name is required'),
    checklist: z.array(z.string()).optional(),
  })).min(1, 'At least one task is required'),
  plan_id: z.string().uuid().optional(),
});

export const updateWorkOrderSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  assigned_to: z.string().uuid().optional(),
  scheduled_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  tasks: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    completed: z.boolean().optional(),
    notes: z.string().optional(),
    checklist: z.array(z.object({
      id: z.string().optional(),
      description: z.string().min(1),
      completed: z.boolean().optional(),
    })).optional(),
  })).optional(),
  notes: z.string().optional(),
  completion_notes: z.string().optional(),
});

// Equipment validation schemas
export const createEquipmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(1, 'Code is required'),
  type: z.string().min(1, 'Type is required'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  company_id: z.string().uuid('Invalid company ID'),
  sector_id: z.string().uuid('Invalid sector ID'),
  sub_section_id: z.string().uuid().optional(),
  location: z.string().optional(),
  status: z.enum(['OPERATIONAL', 'MAINTENANCE', 'STOPPED', 'DECOMMISSIONED']).default('OPERATIONAL'),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  installation_date: z.string().datetime().optional(),
  warranty_expires: z.string().datetime().optional(),
  specifications: z.record(z.any()).optional(),
});

export const updateEquipmentSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  sector_id: z.string().uuid().optional(),
  sub_section_id: z.string().uuid().optional(),
  location: z.string().optional(),
  status: z.enum(['OPERATIONAL', 'MAINTENANCE', 'STOPPED', 'DECOMMISSIONED']).optional(),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  installation_date: z.string().datetime().optional(),
  warranty_expires: z.string().datetime().optional(),
  specifications: z.record(z.any()).optional(),
});

// Company validation schemas
export const createCompanySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  segment: z.string().optional(),
  cnpj: z.string().optional(),
  address: z.object({
    zip: z.string(),
    city: z.string(),
    state: z.string(),
    fullAddress: z.string(),
  }).optional(),
  responsible: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  total_area: z.number().positive().optional(),
  occupants: z.number().positive().optional(),
  hvac_units: z.number().positive().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

// Sector validation schemas
export const createSectorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateSectorSchema = createSectorSchema.partial();

// Query filters
export const planFiltersSchema = z.object({
  company_id: z.string().uuid().optional(),
  sector_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMESTER', 'YEARLY']).optional(),
});

export const workOrderFiltersSchema = z.object({
  company_id: z.string().uuid().optional(),
  sector_id: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigned_to: z.string().uuid().optional(),
  plan_id: z.string().uuid().optional(),
  equipment_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

export const equipmentFiltersSchema = z.object({
  company_id: z.string().uuid().optional(),
  sector_id: z.string().uuid().optional(),
  status: z.enum(['OPERATIONAL', 'MAINTENANCE', 'STOPPED', 'DECOMMISSIONED']).optional(),
  type: z.string().optional(),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

// Type exports
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateSectorInput = z.infer<typeof createSectorSchema>;
export type UpdateSectorInput = z.infer<typeof updateSectorSchema>;
export type PlanFilters = z.infer<typeof planFiltersSchema>;
export type WorkOrderFilters = z.infer<typeof workOrderFiltersSchema>;
export type EquipmentFilters = z.infer<typeof equipmentFiltersSchema>;