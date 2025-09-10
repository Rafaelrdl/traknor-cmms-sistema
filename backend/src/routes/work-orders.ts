import { Router } from 'express';
import { WorkOrderController } from '@/controllers/WorkOrderController';
import { authenticate, authorize } from '@/middlewares/auth';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validation';
import { 
  createWorkOrderSchema,
  updateWorkOrderSchema,
  workOrderFiltersSchema
} from '@/validators/resources';
import { uuidParamSchema, paginationSchema } from '@/validators/auth';
import { z } from 'zod';

const workOrderRoutes = Router();
const workOrderController = new WorkOrderController();

// All routes require authentication
workOrderRoutes.use(authenticate);

// GET /api/work-orders/stats - Get work order statistics
workOrderRoutes.get(
  '/stats',
  workOrderController.getWorkOrderStats
);

// GET /api/work-orders - List work orders
workOrderRoutes.get(
  '/',
  validateQuery(workOrderFiltersSchema.merge(paginationSchema)),
  workOrderController.listWorkOrders
);

// POST /api/work-orders - Create work order
workOrderRoutes.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'TECHNICIAN'),
  validateBody(createWorkOrderSchema),
  workOrderController.createWorkOrder
);

// GET /api/work-orders/:id - Get work order by ID
workOrderRoutes.get(
  '/:id',
  validateParams(uuidParamSchema),
  workOrderController.getWorkOrder
);

// PUT /api/work-orders/:id - Update work order
workOrderRoutes.put(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'TECHNICIAN'),
  validateParams(uuidParamSchema),
  validateBody(updateWorkOrderSchema),
  workOrderController.updateWorkOrder
);

// PUT /api/work-orders/:id/status - Update work order status
workOrderRoutes.put(
  '/:id/status',
  authorize('ADMIN', 'MANAGER', 'TECHNICIAN'),
  validateParams(uuidParamSchema),
  validateBody(z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  })),
  workOrderController.updateWorkOrderStatus
);

// PUT /api/work-orders/:id/assign - Assign work order
workOrderRoutes.put(
  '/:id/assign',
  authorize('ADMIN', 'MANAGER'),
  validateParams(uuidParamSchema),
  validateBody(z.object({
    assignee_id: z.string().uuid('Invalid assignee ID')
  })),
  workOrderController.assignWorkOrder
);

// DELETE /api/work-orders/:id - Delete work order (admin/manager only)
workOrderRoutes.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validateParams(uuidParamSchema),
  workOrderController.deleteWorkOrder
);

export default workOrderRoutes;