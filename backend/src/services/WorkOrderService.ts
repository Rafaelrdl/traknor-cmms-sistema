import prisma from '@/config/database';
import { NotFoundError, ConflictError, ValidationError } from '@/utils/errors';
import { PaginationOptions, getPagination, buildPagination } from '@/utils/response';
import { 
  CreateWorkOrderInput, 
  UpdateWorkOrderInput, 
  WorkOrderFilters 
} from '@/validators/resources';
import { randomUUID } from 'crypto';

export class WorkOrderService {
  
  async listWorkOrders(filters: WorkOrderFilters = {}, options: PaginationOptions = {}) {
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
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }
    
    if (filters.assigned_to) {
      where.assigned_to = filters.assigned_to;
    }
    
    if (filters.plan_id) {
      where.plan_id = filters.plan_id;
    }
    
    if (filters.equipment_id) {
      where.equipment = {
        some: {
          equipment_id: filters.equipment_id
        }
      };
    }
    
    if (filters.date_from || filters.date_to) {
      where.scheduled_date = {};
      if (filters.date_from) {
        where.scheduled_date.gte = new Date(filters.date_from);
      }
      if (filters.date_to) {
        where.scheduled_date.lte = new Date(filters.date_to);
      }
    }
    
    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
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
          plan: {
            select: { id: true, name: true }
          },
          creator: {
            select: { id: true, name: true, email: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          equipment: {
            include: {
              equipment: {
                select: { id: true, name: true, code: true, type: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.workOrder.count({ where })
    ]);
    
    return {
      workOrders: workOrders.map((wo: any) => ({
        ...wo,
        equipment: wo.equipment.map((woe: any) => woe.equipment)
      })),
      pagination: buildPagination(total, page, limit)
    };
  }
  
  async getWorkOrderById(workOrderId: string) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        company: {
          select: { id: true, name: true }
        },
        sector: {
          select: { id: true, name: true }
        },
        plan: {
          select: { id: true, name: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        equipment: {
          include: {
            equipment: true
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            original_name: true,
            mime_type: true,
            size: true,
            uploaded_at: true
          }
        }
      }
    });
    
    if (!workOrder) {
      throw new NotFoundError('Work order not found');
    }
    
    return {
      ...workOrder,
      equipment: workOrder.equipment.map((woe: any) => woe.equipment)
    };
  }
  
  async createWorkOrder(workOrderData: CreateWorkOrderInput, createdBy: string) {
    const { equipment_ids, ...workOrderInfo } = workOrderData;
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: workOrderData.company_id }
    });
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    // Verify sector exists (if provided)
    if (workOrderData.sector_id) {
      const sector = await prisma.sector.findUnique({
        where: { id: workOrderData.sector_id }
      });
      
      if (!sector || sector.company_id !== workOrderData.company_id) {
        throw new ValidationError('Sector not found or does not belong to company');
      }
    }
    
    // Verify equipment exists and belongs to company
    const equipment = await prisma.equipment.findMany({
      where: {
        id: { in: equipment_ids },
        company_id: workOrderData.company_id
      }
    });
    
    if (equipment.length !== equipment_ids.length) {
      throw new ValidationError('Some equipment not found or do not belong to company');
    }
    
    // Verify assignee exists (if provided)
    if (workOrderData.assigned_to) {
      const assignee = await prisma.user.findUnique({
        where: { id: workOrderData.assigned_to, status: 'ACTIVE' }
      });
      
      if (!assignee) {
        throw new NotFoundError('Assignee not found or inactive');
      }
    }
    
    // Generate work order code
    const count = await prisma.workOrder.count();
    const code = `OS-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    
    // Add UUIDs to tasks
    const tasksWithIds = workOrderData.tasks.map(task => ({
      ...task,
      id: randomUUID(),
      completed: false,
      checklist: task.checklist?.map(item => ({
        id: randomUUID(),
        description: item,
        completed: false
      })) || []
    }));
    
    const workOrder = await prisma.workOrder.create({
      data: {
        ...workOrderInfo,
        code,
        status: 'PENDING',
        tasks: tasksWithIds,
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
        plan: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        equipment: {
          include: {
            equipment: { select: { id: true, name: true, code: true, type: true } }
          }
        }
      }
    });
    
    return {
      ...workOrder,
      equipment: workOrder.equipment.map((woe: any) => woe.equipment)
    };
  }
  
  async updateWorkOrder(workOrderId: string, updateData: UpdateWorkOrderInput) {
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId }
    });
    
    if (!existingWorkOrder) {
      throw new NotFoundError('Work order not found');
    }
    
    // Verify assignee exists (if provided)
    if (updateData.assigned_to) {
      const assignee = await prisma.user.findUnique({
        where: { id: updateData.assigned_to, status: 'ACTIVE' }
      });
      
      if (!assignee) {
        throw new NotFoundError('Assignee not found or inactive');
      }
    }
    
    // Handle status transitions
    const finalUpdateData: any = { ...updateData };
    if (updateData.status && updateData.status !== existingWorkOrder.status) {
      this.validateStatusTransition(existingWorkOrder.status, updateData.status);
      
      // Set timestamps based on status
      if (updateData.status === 'IN_PROGRESS' && !existingWorkOrder.started_at) {
        finalUpdateData.started_at = new Date().toISOString();
      } else if (updateData.status === 'COMPLETED' && !existingWorkOrder.completed_at) {
        finalUpdateData.completed_at = new Date().toISOString();
      }
    }
    
    // Process tasks with proper structure
    let tasksUpdate = {};
    if (updateData.tasks) {
      const processedTasks = updateData.tasks.map(task => ({
        id: task.id || randomUUID(),
        name: task.name,
        completed: task.completed || false,
        notes: task.notes || null,
        checklist: task.checklist?.map(item => ({
          id: item.id || randomUUID(),
          description: item.description,
          completed: item.completed || false
        })) || []
      }));
      tasksUpdate = { tasks: processedTasks };
    }
    
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        ...finalUpdateData,
        ...tasksUpdate
      },
      include: {
        company: { select: { id: true, name: true } },
        sector: { select: { id: true, name: true } },
        plan: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        equipment: {
          include: {
            equipment: { select: { id: true, name: true, code: true, type: true } }
          }
        }
      }
    });
    
    return {
      ...updatedWorkOrder,
      equipment: updatedWorkOrder.equipment.map((woe: any) => woe.equipment)
    };
  }
  
  async assignWorkOrder(workOrderId: string, assigneeId: string) {
    // Verify work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId }
    });
    
    if (!workOrder) {
      throw new NotFoundError('Work order not found');
    }
    
    // Verify assignee exists and is active
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId, status: 'ACTIVE' }
    });
    
    if (!assignee) {
      throw new NotFoundError('Assignee not found or inactive');
    }
    
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { assigned_to: assigneeId },
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
    
    return updatedWorkOrder;
  }
  
  async updateWorkOrderStatus(workOrderId: string, status: string) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId }
    });
    
    if (!workOrder) {
      throw new NotFoundError('Work order not found');
    }
    
    this.validateStatusTransition(workOrder.status, status);
    
    const updateData: any = { status };
    
    // Set timestamps based on status
    if (status === 'IN_PROGRESS' && !workOrder.started_at) {
      updateData.started_at = new Date();
    } else if (status === 'COMPLETED' && !workOrder.completed_at) {
      updateData.completed_at = new Date();
    }
    
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData
    });
    
    return updatedWorkOrder;
  }
  
  async deleteWorkOrder(workOrderId: string) {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId }
    });
    
    if (!workOrder) {
      throw new NotFoundError('Work order not found');
    }
    
    // Can only delete pending work orders
    if (workOrder.status !== 'PENDING') {
      throw new ValidationError('Can only delete pending work orders');
    }
    
    await prisma.workOrder.delete({
      where: { id: workOrderId }
    });
    
    return { message: 'Work order deleted successfully' };
  }
  
  async getWorkOrderStats() {
    const stats = await prisma.workOrder.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    const priorityStats = await prisma.workOrder.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      },
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    });
    
    return {
      byStatus: stats,
      byPriority: priorityStats
    };
  }
  
  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'PENDING', 'CANCELLED'],
      'COMPLETED': [], // Cannot change from completed
      'CANCELLED': ['PENDING'] // Can reopen cancelled orders
    };
    
    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}