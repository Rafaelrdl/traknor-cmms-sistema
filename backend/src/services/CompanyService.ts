import prisma from '@/config/database';
import { NotFoundError, ConflictError, ValidationError } from '@/utils/errors';
import { PaginationOptions, getPagination, buildPagination } from '@/utils/response';
import { 
  CreateCompanyInput, 
  UpdateCompanyInput,
  CreateSectorInput,
  UpdateSectorInput
} from '@/validators/resources';

export class CompanyService {
  
  async listCompanies(options: PaginationOptions = {}) {
    const { skip, take, page, limit } = getPagination(options);
    
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        skip,
        take,
        include: {
          sectors: {
            select: { id: true, name: true }
          },
          _count: {
            select: { 
              equipment: true,
              work_orders: true,
              plans: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.company.count()
    ]);
    
    return {
      companies,
      pagination: buildPagination(total, page, limit)
    };
  }
  
  async getCompanyById(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        sectors: {
          include: {
            sub_sections: {
              select: { id: true, name: true }
            },
            _count: {
              select: { equipment: true }
            }
          }
        },
        _count: {
          select: { 
            equipment: true,
            work_orders: true,
            plans: true
          }
        }
      }
    });
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    return company;
  }
  
  async createCompany(companyData: CreateCompanyInput) {
    // Check if CNPJ already exists (if provided)
    if (companyData.cnpj) {
      const existingCompany = await prisma.company.findUnique({
        where: { cnpj: companyData.cnpj }
      });
      
      if (existingCompany) {
        throw new ConflictError('CNPJ already registered');
      }
    }
    
    const company = await prisma.company.create({
      data: companyData,
      include: {
        sectors: true,
        _count: {
          select: { 
            equipment: true,
            work_orders: true,
            plans: true
          }
        }
      }
    });
    
    return company;
  }
  
  async updateCompany(companyId: string, updateData: UpdateCompanyInput) {
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!existingCompany) {
      throw new NotFoundError('Company not found');
    }
    
    // Check CNPJ uniqueness if updating
    if (updateData.cnpj && updateData.cnpj !== existingCompany.cnpj) {
      const existingWithCNPJ = await prisma.company.findUnique({
        where: { cnpj: updateData.cnpj }
      });
      
      if (existingWithCNPJ) {
        throw new ConflictError('CNPJ already registered');
      }
    }
    
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
      include: {
        sectors: true,
        _count: {
          select: { 
            equipment: true,
            work_orders: true,
            plans: true
          }
        }
      }
    });
    
    return updatedCompany;
  }
  
  async deleteCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: { 
            equipment: true,
            work_orders: true,
            plans: true
          }
        }
      }
    });
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    // Check if company has related records
    if (company._count.equipment > 0 || company._count.work_orders > 0 || company._count.plans > 0) {
      throw new ValidationError(
        'Cannot delete company with existing equipment, work orders, or maintenance plans'
      );
    }
    
    await prisma.company.delete({
      where: { id: companyId }
    });
    
    return { message: 'Company deleted successfully' };
  }
  
  async getCompanySectors(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    const sectors = await prisma.sector.findMany({
      where: { company_id: companyId },
      include: {
        sub_sections: {
          select: { id: true, name: true }
        },
        _count: {
          select: { equipment: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return sectors;
  }
  
  async createSector(companyId: string, sectorData: CreateSectorInput) {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    const sector = await prisma.sector.create({
      data: {
        ...sectorData,
        company_id: companyId
      },
      include: {
        sub_sections: true,
        _count: {
          select: { equipment: true }
        }
      }
    });
    
    return sector;
  }
  
  async updateSector(sectorId: string, updateData: UpdateSectorInput) {
    const sector = await prisma.sector.findUnique({
      where: { id: sectorId }
    });
    
    if (!sector) {
      throw new NotFoundError('Sector not found');
    }
    
    const updatedSector = await prisma.sector.update({
      where: { id: sectorId },
      data: updateData,
      include: {
        sub_sections: true,
        _count: {
          select: { equipment: true }
        }
      }
    });
    
    return updatedSector;
  }
  
  async deleteSector(sectorId: string) {
    const sector = await prisma.sector.findUnique({
      where: { id: sectorId },
      include: {
        _count: {
          select: { 
            equipment: true,
            work_orders: true,
            plans: true
          }
        }
      }
    });
    
    if (!sector) {
      throw new NotFoundError('Sector not found');
    }
    
    // Check if sector has related records
    if (sector._count.equipment > 0 || sector._count.work_orders > 0 || sector._count.plans > 0) {
      throw new ValidationError(
        'Cannot delete sector with existing equipment, work orders, or maintenance plans'
      );
    }
    
    await prisma.sector.delete({
      where: { id: sectorId }
    });
    
    return { message: 'Sector deleted successfully' };
  }
}