import { Router } from 'express';
import { EquipmentController } from '@/controllers/EquipmentController';
import { authenticate, authorize } from '@/middlewares/auth';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validation';
import { 
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentFiltersSchema
} from '@/validators/resources';
import { uuidParamSchema, paginationSchema } from '@/validators/auth';

const equipmentRoutes = Router();
const equipmentController = new EquipmentController();

// All routes require authentication
equipmentRoutes.use(authenticate);

// GET /api/equipment - List equipment
equipmentRoutes.get(
  '/',
  validateQuery(equipmentFiltersSchema.merge(paginationSchema)),
  equipmentController.listEquipment
);

// POST /api/equipment - Create equipment (admin/manager only)
equipmentRoutes.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validateBody(createEquipmentSchema),
  equipmentController.createEquipment
);

// GET /api/equipment/:id - Get equipment by ID
equipmentRoutes.get(
  '/:id',
  validateParams(uuidParamSchema),
  equipmentController.getEquipment
);

// PUT /api/equipment/:id - Update equipment (admin/manager only)
equipmentRoutes.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validateParams(uuidParamSchema),
  validateBody(updateEquipmentSchema),
  equipmentController.updateEquipment
);

// DELETE /api/equipment/:id - Delete equipment (admin only)
equipmentRoutes.delete(
  '/:id',
  authorize('ADMIN'),
  validateParams(uuidParamSchema),
  equipmentController.deleteEquipment
);

// GET /api/equipment/:id/history - Get equipment work order history
equipmentRoutes.get(
  '/:id/history',
  validateParams(uuidParamSchema),
  validateQuery(paginationSchema),
  equipmentController.getEquipmentHistory
);

// GET /api/equipment/:id/maintenance-plans - Get equipment maintenance plans
equipmentRoutes.get(
  '/:id/maintenance-plans',
  validateParams(uuidParamSchema),
  equipmentController.getEquipmentMaintenancePlans
);

export default equipmentRoutes;