import { Request, Response, NextFunction } from 'express';
import { CompanyService } from '@/services/CompanyService';
import { successResponse } from '@/utils/response';

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  // GET /api/companies
  listCompanies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query as any;
      const result = await this.companyService.listCompanies({ page, limit });
      
      res.json(successResponse(result.companies, result.pagination));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/companies/:id
  getCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const company = await this.companyService.getCompanyById(id);
      res.json(successResponse(company));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/companies
  createCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const company = await this.companyService.createCompany(req.body);
      res.status(201).json(successResponse(company));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/companies/:id
  updateCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const company = await this.companyService.updateCompany(id, req.body);
      res.json(successResponse(company));
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/companies/:id
  deleteCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.companyService.deleteCompany(id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/companies/:id/sectors
  getCompanySectors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const sectors = await this.companyService.getCompanySectors(id);
      res.json(successResponse(sectors));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/companies/:id/sectors
  createSector = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const sector = await this.companyService.createSector(id, req.body);
      res.status(201).json(successResponse(sector));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/sectors/:id
  updateSector = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const sector = await this.companyService.updateSector(id, req.body);
      res.json(successResponse(sector));
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/sectors/:id
  deleteSector = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.companyService.deleteSector(id);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };
}