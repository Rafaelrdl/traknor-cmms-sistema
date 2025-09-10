import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '@/services/MetricsService';
import { successResponse } from '@/utils/response';
import { z } from 'zod';

export class MetricsController {
  private metricsService: MetricsService;

  constructor() {
    this.metricsService = new MetricsService();
  }

  // GET /api/metrics/summary
  getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await this.metricsService.getDashboardSummary();
      res.json(successResponse(summary));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/metrics/kpis
  getKPIs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { company_id } = req.query as any;
      const kpis = await this.metricsService.getKPIs(company_id);
      res.json(successResponse(kpis));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/metrics/technician-performance
  getTechnicianPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { company_id } = req.query as any;
      const performance = await this.metricsService.getTechnicianPerformance(company_id);
      res.json(successResponse(performance));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/metrics/equipment-availability
  getEquipmentAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { company_id } = req.query as any;
      const availability = await this.metricsService.getEquipmentAvailability(company_id);
      res.json(successResponse(availability));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/metrics/work-order-trends
  getWorkOrderTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { company_id, days } = req.query as any;
      const trends = await this.metricsService.getWorkOrderTrends(
        company_id,
        days ? parseInt(days) : 30
      );
      res.json(successResponse(trends));
    } catch (error) {
      next(error);
    }
  };
}