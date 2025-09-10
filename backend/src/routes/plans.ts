import { Router } from 'express';
import { MaintenancePlanController } from '@/controllers/MaintenancePlanController';
import { authenticate, authorize } from '@/middlewares/auth';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validation';
import { 
  createPlanSchema,
  updatePlanSchema,
  planFiltersSchema
} from '@/validators/resources';
import { uuidParamSchema, paginationSchema } from '@/validators/auth';

const planRoutes = Router();
const planController = new MaintenancePlanController();

// All routes require authentication
planRoutes.use(authenticate);

// GET /api/plans - List maintenance plans
planRoutes.get(
  '/',
  validateQuery(planFiltersSchema.merge(paginationSchema)),
  planController.listPlans
);

// POST /api/plans - Create maintenance plan (admin/manager only)
planRoutes.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validateBody(createPlanSchema),
  planController.createPlan
);

// GET /api/plans/:id - Get maintenance plan by ID
planRoutes.get(
  '/:id',
  validateParams(uuidParamSchema),
  planController.getPlan
);

// PUT /api/plans/:id - Update maintenance plan (admin/manager only)
planRoutes.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validateParams(uuidParamSchema),
  validateBody(updatePlanSchema),
  planController.updatePlan
);

// DELETE /api/plans/:id - Delete maintenance plan (admin only)
planRoutes.delete(
  '/:id',
  authorize('ADMIN'),
  validateParams(uuidParamSchema),
  planController.deletePlan
);

// POST /api/plans/:id/generate-work-orders - Generate work orders from plan
planRoutes.post(
  '/:id/generate-work-orders',
  authorize('ADMIN', 'MANAGER'),
  validateParams(uuidParamSchema),
  planController.generateWorkOrders
);

export default planRoutes;