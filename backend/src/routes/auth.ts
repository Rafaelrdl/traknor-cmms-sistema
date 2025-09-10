import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { authenticate } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validation';
import { 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '@/validators/auth';

const authRoutes = Router();
const authController = new AuthController();

// Public routes
authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
authRoutes.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

// Protected routes
authRoutes.post('/logout', authenticate, authController.logout);
authRoutes.post('/refresh', authenticate, authController.refresh);
authRoutes.get('/me', authenticate, authController.me);

export default authRoutes;