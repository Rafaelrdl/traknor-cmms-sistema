import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/UserService';
import { successResponse } from '@/utils/response';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // POST /api/auth/login
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.authenticate(req.body);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/auth/logout
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Since we're using stateless JWT, logout is handled client-side
      // In production, you might want to blacklist tokens
      res.json(successResponse({ message: 'Logout successful' }));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/auth/me
  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getCurrentUser(req.user!.id);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/auth/refresh
  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // For simplicity, we'll just return a new token based on the existing user
      // In production, you should validate the refresh token properly
      const result = await this.userService.authenticate({
        email: req.user!.email,
        password: 'dummy', // This won't be validated in refresh
      });
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/auth/forgot-password
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement forgot password logic
      res.json(successResponse({ 
        message: 'If the email exists, a reset link has been sent' 
      }));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/auth/reset-password
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement reset password logic
      res.json(successResponse({ 
        message: 'Password has been reset successfully' 
      }));
    } catch (error) {
      next(error);
    }
  };
}