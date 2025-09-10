import { Request, Response, NextFunction } from 'express';
import { WorkOrderService } from '@/services/WorkOrderService';
import { successResponse } from '@/utils/response';

export class WorkOrderController {
  private workOrderService: WorkOrderService;

  constructor() {
    this.workOrderService = new WorkOrderService();
  }

  // GET /api/work-orders
  listWorkOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, ...filters } = req.query as any;
      const result = await this.workOrderService.listWorkOrders(filters, { page, limit });
      
      res.json(successResponse(result.workOrders, result.pagination));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/work-orders/:id
  getWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const workOrder = await this.workOrderService.getWorkOrderById(id);
      res.json(successResponse(workOrder));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/work-orders
  createWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workOrder = await this.workOrderService.createWorkOrder(req.body, req.user!.id);
      res.status(201).json(successResponse(workOrder));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/work-orders/:id
  updateWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const workOrder = await this.workOrderService.updateWorkOrder(id, req.body);
      res.json(successResponse(workOrder));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/work-orders/:id/status
  updateWorkOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const workOrder = await this.workOrderService.updateWorkOrderStatus(id, status);
      res.json(successResponse(workOrder));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/work-orders/:id/assign
  assignWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { assignee_id } = req.body;
      const workOrder = await this.workOrderService.assignWorkOrder(id, assignee_id);
      res.json(successResponse(workOrder));
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/work-orders/:id
  deleteWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.workOrderService.deleteWorkOrder(id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/work-orders/stats
  getWorkOrderStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.workOrderService.getWorkOrderStats();
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  };
}