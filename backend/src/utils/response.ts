export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const successResponse = <T>(data: T, pagination?: ApiResponse<T>['pagination']): ApiResponse<T> => ({
  success: true,
  data,
  ...(pagination && { pagination }),
});

export const errorResponse = (
  code: string, 
  message: string, 
  details?: any
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details }),
  },
});

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const getPagination = (
  options: PaginationOptions = {}
): { skip: number; take: number; page: number; limit: number } => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;
  
  return { skip, take: limit, page, limit };
};

export const buildPagination = (
  total: number,
  page: number,
  limit: number
): PaginationResult => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});