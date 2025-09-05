import { Router } from 'express';
import { CompanyController } from '@/controllers/CompanyController';
import { authenticate, authorize } from '@/middlewares/auth';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validation';
import { 
  createCompanySchema,
  updateCompanySchema,
  createSectorSchema,
  updateSectorSchema
} from '@/validators/resources';
import { uuidParamSchema, paginationSchema } from '@/validators/auth';

const companyRoutes = Router();
const companyController = new CompanyController();

// All routes require authentication
companyRoutes.use(authenticate);

// GET /api/companies - List companies
companyRoutes.get(
  '/',
  validateQuery(paginationSchema),
  companyController.listCompanies
);

// POST /api/companies - Create company (admin only)
companyRoutes.post(
  '/',
  authorize('ADMIN'),
  validateBody(createCompanySchema),
  companyController.createCompany
);

// GET /api/companies/:id - Get company by ID
companyRoutes.get(
  '/:id',
  validateParams(uuidParamSchema),
  companyController.getCompany
);

// PUT /api/companies/:id - Update company (admin only)
companyRoutes.put(
  '/:id',
  authorize('ADMIN'),
  validateParams(uuidParamSchema),
  validateBody(updateCompanySchema),
  companyController.updateCompany
);

// DELETE /api/companies/:id - Delete company (admin only)
companyRoutes.delete(
  '/:id',
  authorize('ADMIN'),
  validateParams(uuidParamSchema),
  companyController.deleteCompany
);

// GET /api/companies/:id/sectors - Get company sectors
companyRoutes.get(
  '/:id/sectors',
  validateParams(uuidParamSchema),
  companyController.getCompanySectors
);

// POST /api/companies/:id/sectors - Create sector (admin/manager only)
companyRoutes.post(
  '/:id/sectors',
  authorize('ADMIN', 'MANAGER'),
  validateParams(uuidParamSchema),
  validateBody(createSectorSchema),
  companyController.createSector
);

// PUT /api/sectors/:id - Update sector (admin/manager only)
companyRoutes.put(
  '/sectors/:id',
  authorize('ADMIN', 'MANAGER'),
  validateParams(uuidParamSchema),
  validateBody(updateSectorSchema),
  companyController.updateSector
);

// DELETE /api/sectors/:id - Delete sector (admin only)
companyRoutes.delete(
  '/sectors/:id',
  authorize('ADMIN'),
  validateParams(uuidParamSchema),
  companyController.deleteSector
);

export default companyRoutes;