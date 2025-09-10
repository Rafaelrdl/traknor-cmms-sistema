import { Router } from 'express';
import { MetricsController } from '@/controllers/MetricsController';
import { authenticate } from '@/middlewares/auth';
import { validateQuery } from '@/middlewares/validation';
import { z } from 'zod';

const metricsRoutes = Router();
const metricsController = new MetricsController();

// All routes require authentication
metricsRoutes.use(authenticate);

const metricsQuerySchema = z.object({
  company_id: z.string().uuid().optional(),
});

const trendsQuerySchema = z.object({
  company_id: z.string().uuid().optional(),
  days: z.coerce.number().min(1).max(365).optional(),
});

// GET /api/metrics/summary - Get dashboard summary
metricsRoutes.get(
  '/summary',
  metricsController.getDashboardSummary
);

// GET /api/metrics/kpis - Get key performance indicators
metricsRoutes.get(
  '/kpis',
  validateQuery(metricsQuerySchema),
  metricsController.getKPIs
);

// GET /api/metrics/technician-performance - Get technician performance stats
metricsRoutes.get(
  '/technician-performance',
  validateQuery(metricsQuerySchema),
  metricsController.getTechnicianPerformance
);

// GET /api/metrics/equipment-availability - Get equipment availability stats
metricsRoutes.get(
  '/equipment-availability',
  validateQuery(metricsQuerySchema),
  metricsController.getEquipmentAvailability
);

// GET /api/metrics/work-order-trends - Get work order trends
metricsRoutes.get(
  '/work-order-trends',
  validateQuery(trendsQuerySchema),
  metricsController.getWorkOrderTrends
);

export default metricsRoutes;