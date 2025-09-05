import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { authenticate, authorize } from '@/middlewares/auth';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validation';
import { 
  createUserSchema,
  updateUserSchema,
  updateUserPreferencesSchema,
  updateUserSecuritySchema,
  uuidParamSchema,
  paginationSchema
} from '@/validators/auth';

const userRoutes = Router();
const userController = new UserController();

// All routes require authentication
userRoutes.use(authenticate);

// GET /api/users - List users (admin/manager only)
userRoutes.get(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validateQuery(paginationSchema),
  userController.listUsers
);

// POST /api/users - Create user (admin only)
userRoutes.post(
  '/',
  authorize('ADMIN'),
  validateBody(createUserSchema),
  userController.createUser
);

// GET /api/users/:id - Get user by ID
userRoutes.get(
  '/:id',
  validateParams(uuidParamSchema),
  userController.getUser
);

// PUT /api/users/:id - Update user (admin/manager or self)
userRoutes.put(
  '/:id',
  validateParams(uuidParamSchema),
  validateBody(updateUserSchema),
  userController.updateUser
);

// PUT /api/users/:id/preferences - Update user preferences (self only)
userRoutes.put(
  '/:id/preferences',
  validateParams(uuidParamSchema),
  validateBody(updateUserPreferencesSchema),
  userController.updateUserPreferences
);

// PUT /api/users/:id/security - Update user security settings (self only)
userRoutes.put(
  '/:id/security',
  validateParams(uuidParamSchema),
  validateBody(updateUserSecuritySchema),
  userController.updateUserSecurity
);

// DELETE /api/users/:id - Delete user (admin only)
userRoutes.delete(
  '/:id',
  authorize('ADMIN'),
  validateParams(uuidParamSchema),
  userController.deleteUser
);

export default userRoutes;