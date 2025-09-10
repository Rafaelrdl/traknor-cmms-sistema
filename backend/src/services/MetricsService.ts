import prisma from '@/config/database';
import { NotFoundError } from '@/utils/errors';

export class MetricsService {
  
  async getDashboardSummary() {
    const [
      totalWorkOrders,
      pendingWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      totalEquipment,
      operationalEquipment,
      maintenanceEquipment,
      totalPlans,
      activePlans,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      prisma.workOrder.count(),
      prisma.workOrder.count({ where: { status: 'PENDING' } }),
      prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.workOrder.count({ where: { status: 'COMPLETED' } }),
      prisma.equipment.count(),
      prisma.equipment.count({ where: { status: 'OPERATIONAL' } }),
      prisma.equipment.count({ where: { status: 'MAINTENANCE' } }),
      prisma.maintenancePlan.count(),
      prisma.maintenancePlan.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
    ]);
    
    return {
      workOrders: {
        total: totalWorkOrders,
        pending: pendingWorkOrders,
        inProgress: inProgressWorkOrders,
        completed: completedWorkOrders,
        completionRate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
      },
      equipment: {
        total: totalEquipment,
        operational: operationalEquipment,
        maintenance: maintenanceEquipment,
        availabilityRate: totalEquipment > 0 ? (operationalEquipment / totalEquipment) * 100 : 0,
      },
      plans: {
        total: totalPlans,
        active: activePlans,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
    };
  }
  
  async getKPIs(companyId?: string) {
    const whereClause = companyId ? { company_id: companyId } : {};
    
    // Get work orders from last 30 days for MTTR calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedWorkOrders = await prisma.workOrder.findMany({
      where: {
        ...whereClause,
        status: 'COMPLETED',
        started_at: { not: null },
        completed_at: { 
          not: null,
          gte: thirtyDaysAgo,
        },
      },
      select: {
        started_at: true,
        completed_at: true,
        actual_hours: true,
      }
    });
    
    // Calculate MTTR (Mean Time To Repair)
    let totalRepairHours = 0;
    let totalRepairCount = 0;
    
    completedWorkOrders.forEach((wo: any) => {
      if (wo.started_at && wo.completed_at) {
        const repairTime = (new Date(wo.completed_at).getTime() - new Date(wo.started_at).getTime()) / (1000 * 60 * 60);
        totalRepairHours += repairTime;
        totalRepairCount++;
      }
    });
    
    const mttr = totalRepairCount > 0 ? totalRepairHours / totalRepairCount : 0;
    
    // Get preventive vs corrective work orders
    const [preventiveCount, correctiveCount, totalCurrentMonth] = await Promise.all([
      prisma.workOrder.count({
        where: {
          ...whereClause,
          type: 'PREVENTIVE',
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.workOrder.count({
        where: {
          ...whereClause,
          type: 'CORRECTIVE',
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.workOrder.count({
        where: {
          ...whereClause,
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);
    
    const preventiveRate = totalCurrentMonth > 0 ? (preventiveCount / totalCurrentMonth) * 100 : 0;
    
    // Get overdue work orders
    const overdueCount = await prisma.workOrder.count({
      where: {
        ...whereClause,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        due_date: {
          lt: new Date(),
        },
      },
    });
    
    // Get equipment availability
    const [totalEquipment, operationalEquipment] = await Promise.all([
      prisma.equipment.count({ where: companyId ? { company_id: companyId } : {} }),
      prisma.equipment.count({ 
        where: { 
          ...(companyId ? { company_id: companyId } : {}),
          status: 'OPERATIONAL' 
        } 
      }),
    ]);
    
    const equipmentAvailability = totalEquipment > 0 ? (operationalEquipment / totalEquipment) * 100 : 0;
    
    return {
      mttr: {
        value: Math.round(mttr * 100) / 100,
        unit: 'hours',
        description: 'Mean Time To Repair (last 30 days)',
      },
      preventiveRate: {
        value: Math.round(preventiveRate * 100) / 100,
        unit: '%',
        description: 'Preventive maintenance rate (current month)',
      },
      equipmentAvailability: {
        value: Math.round(equipmentAvailability * 100) / 100,
        unit: '%',
        description: 'Equipment availability rate',
      },
      overdueWorkOrders: {
        value: overdueCount,
        unit: 'orders',
        description: 'Overdue work orders',
      },
      totalWorkOrders: {
        value: totalCurrentMonth,
        unit: 'orders',
        description: 'Work orders created this month',
      },
    };
  }
  
  async getTechnicianPerformance(companyId?: string) {
    const whereClause = companyId ? { company_id: companyId } : {};
    
    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const workOrders = await prisma.workOrder.findMany({
      where: {
        ...whereClause,
        assigned_to: { not: null },
        completed_at: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        assigned_to: true,
        status: true,
        actual_hours: true,
        estimated_hours: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Group by technician
    const technicianStats = new Map();
    
    workOrders.forEach((wo: any) => {
      if (!wo.assignee) return;
      
      const techId = wo.assignee.id;
      if (!technicianStats.has(techId)) {
        technicianStats.set(techId, {
          technician: wo.assignee,
          totalOrders: 0,
          completedOrders: 0,
          totalHours: 0,
          averageTime: 0,
        });
      }
      
      const stats = technicianStats.get(techId);
      stats.totalOrders++;
      
      if (wo.status === 'COMPLETED') {
        stats.completedOrders++;
        if (wo.actual_hours) {
          stats.totalHours += wo.actual_hours;
        }
      }
    });
    
    // Convert to array and calculate averages
    const result = Array.from(technicianStats.values()).map(stats => ({
      ...stats,
      completionRate: stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0,
      averageTime: stats.completedOrders > 0 ? stats.totalHours / stats.completedOrders : 0,
    }));
    
    return result.sort((a, b) => b.completedOrders - a.completedOrders);
  }
  
  async getEquipmentAvailability(companyId?: string) {
    const whereClause = companyId ? { company_id: companyId } : {};
    
    const equipmentByStatus = await prisma.equipment.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true,
      },
    });
    
    const equipmentByCriticality = await prisma.equipment.groupBy({
      by: ['criticality'],
      where: whereClause,
      _count: {
        criticality: true,
      },
    });
    
    const equipmentByType = await prisma.equipment.groupBy({
      by: ['type'],
      where: whereClause,
      _count: {
        type: true,
      },
      take: 10, // Top 10 types
      orderBy: {
        _count: {
          type: 'desc',
        },
      },
    });
    
    return {
      byStatus: equipmentByStatus,
      byCriticality: equipmentByCriticality,
      byType: equipmentByType,
    };
  }
  
  async getWorkOrderTrends(companyId?: string, days: number = 30) {
    const whereClause = companyId ? { company_id: companyId } : {};
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get work orders created in the period
    const workOrdersCreated = await prisma.workOrder.groupBy({
      by: ['type'],
      where: {
        ...whereClause,
        created_at: {
          gte: startDate,
        },
      },
      _count: {
        type: true,
      },
    });
    
    // Get work orders completed in the period
    const workOrdersCompleted = await prisma.workOrder.groupBy({
      by: ['type'],
      where: {
        ...whereClause,
        status: 'COMPLETED',
        completed_at: {
          gte: startDate,
        },
      },
      _count: {
        type: true,
      },
    });
    
    // Get work orders by priority
    const workOrdersByPriority = await prisma.workOrder.groupBy({
      by: ['priority'],
      where: {
        ...whereClause,
        created_at: {
          gte: startDate,
        },
      },
      _count: {
        priority: true,
      },
    });
    
    return {
      created: workOrdersCreated,
      completed: workOrdersCompleted,
      byPriority: workOrdersByPriority,
      period: `${days} days`,
    };
  }
}