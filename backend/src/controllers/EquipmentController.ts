import { Request, Response, NextFunction } from 'express';
import { EquipmentService } from '@/services/EquipmentService';
import { successResponse } from '@/utils/response';

export class EquipmentController {
  private equipmentService: EquipmentService;

  constructor() {
    this.equipmentService = new EquipmentService();
  }

  // GET /api/equipment
  listEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, ...filters } = req.query as any;
      const result = await this.equipmentService.listEquipment(filters, { page, limit });
      
      res.json(successResponse(result.equipment, result.pagination));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/equipment/:id
  getEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const equipment = await this.equipmentService.getEquipmentById(id);
      res.json(successResponse(equipment));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/equipment
  createEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipment = await this.equipmentService.createEquipment(req.body);
      res.status(201).json(successResponse(equipment));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/equipment/:id
  updateEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const equipment = await this.equipmentService.updateEquipment(id, req.body);
      res.json(successResponse(equipment));
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/equipment/:id
  deleteEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.equipmentService.deleteEquipment(id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/equipment/:id/history
  getEquipmentHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { page, limit } = req.query as any;
      const result = await this.equipmentService.getEquipmentHistory(id, { page, limit });
      
      res.json(successResponse(result.history, result.pagination));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/equipment/:id/maintenance-plans
  getEquipmentMaintenancePlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const plans = await this.equipmentService.getEquipmentMaintenancePlans(id);
      res.json(successResponse(plans));
    } catch (error) {
      next(error);
    }
  };
}