import prisma from '@/config/database';
import { NotFoundError, ConflictError, ValidationError } from '@/utils/errors';
import { PaginationOptions, getPagination, buildPagination } from '@/utils/response';
import { 
  CreatePlanInput, 
  UpdatePlanInput, 
  PlanFilters 
} from '@/validators/resources';
import { randomUUID } from 'crypto';

export class MaintenancePlanService {
  
  async listPlans(filters: PlanFilters = {}, options: PaginationOptions = {}) {
    const { skip, take, page, limit } = getPagination(options);
    
    const where: any = {};
    
    if (filters.company_id) {
      where.company_id = filters.company_id;
    }
    
    if (filters.sector_id) {
      where.sector_id = filters.sector_id;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.frequency) {
      where.frequency = filters.frequency;
    }
    
    const [plans, total] = await Promise.all([
      prisma.maintenancePlan.findMany({
        where,
        skip,
        take,
        include: {
          company: {
            select: { id: true, name: true }
          },
          sector: {
            select: { id: true, name: true }
          },
          creator: {
            select: { id: true, name: true, email: true }
          },
          equipment: {
            include: {
              equipment: {
                select: { id: true, name: true, code: true, type: true }
              }
            }
          },
          _count: {
            select: { work_orders: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.maintenancePlan.count({ where })
    ]);
    
    return {
      plans: plans.map((plan: any) => ({
        ...plan,
        equipment: plan.equipment.map((pe: any) => pe.equipment),
        work_orders_count: plan._count.work_orders,
      })),
      pagination: buildPagination(total, page, limit)
    };
  }
  
  async getPlanById(planId: string) {
    const plan = await prisma.maintenancePlan.findUnique({
      where: { id: planId },
      include: {
        company: {
          select: { id: true, name: true }
        },
        sector: {
          select: { id: true, name: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        equipment: {
          include: {
            equipment: {
              select: { id: true, name: true, code: true, type: true }
            }
          }
        },
        work_orders: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            scheduled_date: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    });
    
    if (!plan) {
      throw new NotFoundError('Maintenance plan not found');
    }
    
    return {
      ...plan,
      equipment: plan.equipment.map((pe: any) => pe.equipment)
    };
  }
  
  async createPlan(planData: CreatePlanInput, createdBy: string) {
    const { equipment_ids, ...planInfo } = planData;
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: planData.company_id }
    });
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    // Verify sector exists (if provided)
    if (planData.sector_id) {
      const sector = await prisma.sector.findUnique({
        where: { id: planData.sector_id }
      });
      
      if (!sector || sector.company_id !== planData.company_id) {
        throw new ValidationError('Sector not found or does not belong to company');
      }
    }
    
    // Verify equipment exists and belongs to company
    const equipment = await prisma.equipment.findMany({
      where: {
        id: { in: equipment_ids },
        company_id: planData.company_id
      }
    });
    
    if (equipment.length !== equipment_ids.length) {
      throw new ValidationError('Some equipment not found or do not belong to company');
    }
    
    // Add UUID to tasks
    const tasksWithIds = planData.tasks.map(task => ({
      ...task,
      id: randomUUID()
    }));
    
    // Calculate next execution date based on frequency
    const nextExecutionDate = this.calculateNextExecution(
      planData.start_date || new Date().toISOString(),
      planData.frequency
    );
    
    const plan = await prisma.maintenancePlan.create({
      data: {
        ...planInfo,
        tasks: tasksWithIds,
        next_execution_date: nextExecutionDate,
        created_by: createdBy,
        equipment: {
          create: equipment_ids.map(equipmentId => ({
            equipment_id: equipmentId
          }))
        }
      },
      include: {
        company: { select: { id: true, name: true } },
        sector: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
        equipment: {
          include: {
            equipment: { select: { id: true, name: true, code: true, type: true } }
          }
        }
      }
    });
    
    return {
      ...plan,
      equipment: plan.equipment.map((pe: any) => pe.equipment)
    };
  }
  
  async updatePlan(planId: string, updateData: UpdatePlanInput) {
    const existingPlan = await prisma.maintenancePlan.findUnique({
      where: { id: planId },
      include: { equipment: true }
    });
    
    if (!existingPlan) {
      throw new NotFoundError('Maintenance plan not found');
    }
    
    const { equipment_ids, ...planInfo } = updateData;
    
    // Handle equipment updates
    let equipmentUpdates = {};
    if (equipment_ids) {
      // Verify equipment exists and belongs to company
      const equipment = await prisma.equipment.findMany({
        where: {
          id: { in: equipment_ids },
          company_id: existingPlan.company_id
        }
      });
      
      if (equipment.length !== equipment_ids.length) {
        throw new ValidationError('Some equipment not found or do not belong to company');
      }
      
      equipmentUpdates = {
        equipment: {
          deleteMany: {}, // Remove all existing equipment
          create: equipment_ids.map(equipmentId => ({
            equipment_id: equipmentId
          }))
        }
      };
    }
    
    // Add UUIDs to new tasks if provided
    let tasksUpdate = {};
    if (updateData.tasks) {
      const tasksWithIds = updateData.tasks.map((task: any) => ({
        ...task,
        id: task.id || randomUUID()
      }));
      tasksUpdate = { tasks: tasksWithIds };
    }
    
    // Update next execution date if frequency changed
    let nextExecutionUpdate = {};
    if (updateData.frequency && updateData.frequency !== existingPlan.frequency) {
      const nextExecutionDate = this.calculateNextExecution(
        existingPlan.start_date?.toISOString() || new Date().toISOString(),
        updateData.frequency
      );
      nextExecutionUpdate = { next_execution_date: nextExecutionDate };
    }
    
    const updatedPlan = await prisma.maintenancePlan.update({
      where: { id: planId },
      data: {
        ...planInfo,
        ...tasksUpdate,
        ...nextExecutionUpdate,
        ...equipmentUpdates
      },
      include: {
        company: { select: { id: true, name: true } },
        sector: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
        equipment: {
          include: {
            equipment: { select: { id: true, name: true, code: true, type: true } }
          }
        }
      }
    });
    
    return {
      ...updatedPlan,
      equipment: updatedPlan.equipment.map((pe: any) => pe.equipment)
    };
  }
  
  async deletePlan(planId: string) {
    const plan = await prisma.maintenancePlan.findUnique({
      where: { id: planId },
      include: {
        work_orders: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] }
          }
        }
      }
    });
    
    if (!plan) {
      throw new NotFoundError('Maintenance plan not found');
    }
    
    // Check if there are active work orders
    if (plan.work_orders.length > 0) {
      throw new ValidationError(
        'Cannot delete plan with pending or in-progress work orders'
      );
    }
    
    // Soft delete by setting status to INACTIVE
    await prisma.maintenancePlan.update({
      where: { id: planId },
      data: { status: 'INACTIVE' }
    });
    
    return { message: 'Plan deactivated successfully' };
  }
  
  async generateWorkOrders(planId: string, createdBy: string) {
    const plan = await prisma.maintenancePlan.findUnique({
      where: { id: planId, status: 'ACTIVE' },
      include: {
        equipment: {
          include: { equipment: true }
        }
      }
    });
    
    if (!plan) {
      throw new NotFoundError('Active maintenance plan not found');
    }
    
    if (!plan.next_execution_date || plan.next_execution_date > new Date()) {
      throw new ValidationError('Plan is not ready for work order generation');
    }
    
    // Generate work order code
    const count = await prisma.workOrder.count();
    const code = `OS-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    
    const workOrder = await prisma.workOrder.create({
      data: {
        code,
        title: `${plan.name} - ${new Date().toLocaleDateString('pt-BR')}`,
        description: plan.description,
        type: 'PREVENTIVE',
        priority: 'MEDIUM',
        status: 'PENDING',
        company_id: plan.company_id,
        sector_id: plan.sector_id,
        plan_id: plan.id,
        scheduled_date: plan.next_execution_date,
        tasks: plan.tasks,
        created_by: createdBy,
        equipment: {
          create: plan.equipment.map((pe: any) => ({
            equipment_id: pe.equipment_id
          }))
        }
      }
    });
    
    // Update plan's next execution date
    const nextExecutionDate = this.calculateNextExecution(
      plan.next_execution_date.toISOString(),
      plan.frequency
    );
    
    await prisma.maintenancePlan.update({
      where: { id: planId },
      data: { next_execution_date: nextExecutionDate }
    });
    
    return workOrder;
  }
  
  private calculateNextExecution(fromDate: string, frequency: string): Date {
    const date = new Date(fromDate);
    
    switch (frequency) {
      case 'DAILY':
        date.setDate(date.getDate() + 1);
        break;
      case 'WEEKLY':
        date.setDate(date.getDate() + 7);
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'QUARTERLY':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'SEMESTER':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        throw new ValidationError('Invalid frequency');
    }
    
    return date;
  }
}