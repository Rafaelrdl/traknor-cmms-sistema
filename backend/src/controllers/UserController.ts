import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/UserService';
import { successResponse } from '@/utils/response';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/auth/me
  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getCurrentUser(req.user!.id);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/users
  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as any;
      const result = await this.userService.listUsers({ page, limit });
      
      res.json(successResponse(result.users, result.pagination));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/users/:id
  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getCurrentUser(id);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/users
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.createUser(req.body, req.user!.id);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/users/:id
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUser(id, req.body);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/users/:id/preferences
  updateUserPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUserPreferences(id, req.body);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/users/:id/security
  updateUserSecurity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUserSecurity(id, req.body);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/users/:id
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };
}