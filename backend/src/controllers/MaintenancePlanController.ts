import { Request, Response, NextFunction } from 'express';
import { MaintenancePlanService } from '@/services/MaintenancePlanService';
import { successResponse } from '@/utils/response';

export class MaintenancePlanController {
  private planService: MaintenancePlanService;

  constructor() {
    this.planService = new MaintenancePlanService();
  }

  // GET /api/plans
  listPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, ...filters } = req.query as any;
      const result = await this.planService.listPlans(filters, { page, limit });
      
      res.json(successResponse(result.plans, result.pagination));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/plans/:id
  getPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const plan = await this.planService.getPlanById(id);
      res.json(successResponse(plan));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/plans
  createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.planService.createPlan(req.body, req.user!.id);
      res.status(201).json(successResponse(plan));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/plans/:id
  updatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const plan = await this.planService.updatePlan(id, req.body);
      res.json(successResponse(plan));
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/plans/:id
  deletePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.planService.deletePlan(id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/plans/:id/generate-work-orders
  generateWorkOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const workOrder = await this.planService.generateWorkOrders(id, req.user!.id);
      res.status(201).json(successResponse(workOrder));
    } catch (error) {
      next(error);
    }
  };
}