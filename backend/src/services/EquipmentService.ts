import prisma from '@/config/database';
import { NotFoundError, ConflictError, ValidationError } from '@/utils/errors';
import { PaginationOptions, getPagination, buildPagination } from '@/utils/response';
import { 
  CreateEquipmentInput, 
  UpdateEquipmentInput, 
  EquipmentFilters 
} from '@/validators/resources';

export class EquipmentService {
  
  async listEquipment(filters: EquipmentFilters = {}, options: PaginationOptions = {}) {
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
      where.type = { contains: filters.type, mode: 'insensitive' };
    }
    
    if (filters.criticality) {
      where.criticality = filters.criticality;
    }
    
    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
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
          sub_section: {
            select: { id: true, name: true }
          },
          _count: {
            select: { 
              work_orders: true,
              plan_equipments: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.equipment.count({ where })
    ]);
    
    return {
      equipment,
      pagination: buildPagination(total, page, limit)
    };
  }
  
  async getEquipmentById(equipmentId: string) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        company: {
          select: { id: true, name: true }
        },
        sector: {
          select: { id: true, name: true }
        },
        sub_section: {
          select: { id: true, name: true }
        },
        work_orders: {
          include: {
            work_order: {
              select: {
                id: true,
                code: true,
                title: true,
                type: true,
                status: true,
                priority: true,
                scheduled_date: true,
                completed_at: true,
                created_at: true
              }
            }
          },
          orderBy: {
            work_order: { created_at: 'desc' }
          },
          take: 20
        },
        plan_equipments: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                frequency: true,
                status: true,
                next_execution_date: true
              }
            }
          }
        }
      }
    });
    
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }
    
    return {
      ...equipment,
      work_order_history: equipment.work_orders.map((wo: any) => wo.work_order),
      maintenance_plans: equipment.plan_equipments.map((pe: any) => pe.plan)
    };
  }
  
  async createEquipment(equipmentData: CreateEquipmentInput) {
    // Check if code already exists
    const existingEquipment = await prisma.equipment.findUnique({
      where: { code: equipmentData.code }
    });
    
    if (existingEquipment) {
      throw new ConflictError('Equipment code already exists');
    }
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: equipmentData.company_id }
    });
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    // Verify sector exists and belongs to company
    const sector = await prisma.sector.findUnique({
      where: { id: equipmentData.sector_id }
    });
    
    if (!sector || sector.company_id !== equipmentData.company_id) {
      throw new ValidationError('Sector not found or does not belong to company');
    }
    
    // Verify sub_section exists and belongs to sector (if provided)
    if (equipmentData.sub_section_id) {
      const subSection = await prisma.subSection.findUnique({
        where: { id: equipmentData.sub_section_id }
      });
      
      if (!subSection || subSection.sector_id !== equipmentData.sector_id) {
        throw new ValidationError('Sub-section not found or does not belong to sector');
      }
    }
    
    const equipment = await prisma.equipment.create({
      data: equipmentData,
      include: {
        company: { select: { id: true, name: true } },
        sector: { select: { id: true, name: true } },
        sub_section: { select: { id: true, name: true } },
        _count: {
          select: { 
            work_orders: true,
            plan_equipments: true
          }
        }
      }
    });
    
    return equipment;
  }
  
  async updateEquipment(equipmentId: string, updateData: UpdateEquipmentInput) {
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });
    
    if (!existingEquipment) {
      throw new NotFoundError('Equipment not found');
    }
    
    // Check code uniqueness if updating
    if (updateData.code && updateData.code !== existingEquipment.code) {
      const existingWithCode = await prisma.equipment.findUnique({
        where: { code: updateData.code }
      });
      
      if (existingWithCode) {
        throw new ConflictError('Equipment code already exists');
      }
    }
    
    // Verify sector exists and belongs to company (if updating)
    if (updateData.sector_id) {
      const sector = await prisma.sector.findUnique({
        where: { id: updateData.sector_id }
      });
      
      if (!sector || sector.company_id !== existingEquipment.company_id) {
        throw new ValidationError('Sector not found or does not belong to company');
      }
    }
    
    // Verify sub_section exists and belongs to sector (if provided)
    if (updateData.sub_section_id) {
      const sectorId = updateData.sector_id || existingEquipment.sector_id;
      const subSection = await prisma.subSection.findUnique({
        where: { id: updateData.sub_section_id }
      });
      
      if (!subSection || subSection.sector_id !== sectorId) {
        throw new ValidationError('Sub-section not found or does not belong to sector');
      }
    }
    
    const updatedEquipment = await prisma.equipment.update({
      where: { id: equipmentId },
      data: updateData,
      include: {
        company: { select: { id: true, name: true } },
        sector: { select: { id: true, name: true } },
        sub_section: { select: { id: true, name: true } },
        _count: {
          select: { 
            work_orders: true,
            plan_equipments: true
          }
        }
      }
    });
    
    return updatedEquipment;
  }
  
  async deleteEquipment(equipmentId: string) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        _count: {
          select: { 
            work_orders: true,
            plan_equipments: true
          }
        }
      }
    });
    
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }
    
    // Check if equipment has related records
    if (equipment._count.work_orders > 0 || equipment._count.plan_equipments > 0) {
      throw new ValidationError(
        'Cannot delete equipment with existing work orders or maintenance plans'
      );
    }
    
    await prisma.equipment.delete({
      where: { id: equipmentId }
    });
    
    return { message: 'Equipment deleted successfully' };
  }
  
  async getEquipmentHistory(equipmentId: string, options: PaginationOptions = {}) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });
    
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }
    
    const { skip, take, page, limit } = getPagination(options);
    
    const [workOrders, total] = await Promise.all([
      prisma.workOrderEquipment.findMany({
        where: { equipment_id: equipmentId },
        skip,
        take,
        include: {
          work_order: {
            select: {
              id: true,
              code: true,
              title: true,
              type: true,
              status: true,
              priority: true,
              scheduled_date: true,
              started_at: true,
              completed_at: true,
              actual_hours: true,
              completion_notes: true,
              created_at: true,
              assignee: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: {
          work_order: { created_at: 'desc' }
        }
      }),
      prisma.workOrderEquipment.count({
        where: { equipment_id: equipmentId }
      })
    ]);
    
    return {
      history: workOrders.map((woe: any) => woe.work_order),
      pagination: buildPagination(total, page, limit)
    };
  }
  
  async getEquipmentMaintenancePlans(equipmentId: string) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });
    
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }
    
    const planEquipments = await prisma.planEquipment.findMany({
      where: { equipment_id: equipmentId },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            frequency: true,
            status: true,
            next_execution_date: true,
            auto_generate: true,
            created_at: true,
            creator: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
    
    return planEquipments.map((pe: any) => pe.plan);
  }
}