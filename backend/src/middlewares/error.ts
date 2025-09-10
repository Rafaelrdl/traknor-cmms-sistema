import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { errorResponse } from '@/utils/response';
import logger from '@/config/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?.id,
  });

  // Mongoose/Prisma validation errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return res.status(409).json(
        errorResponse(
          'CONFLICT_ERROR',
          `Resource already exists: ${prismaError.meta?.target?.join(', ') || 'unique constraint violated'}`
        )
      );
    }
    
    // Record not found
    if (prismaError.code === 'P2025') {
      return res.status(404).json(
        errorResponse('NOT_FOUND_ERROR', 'Resource not found')
      );
    }
  }

  // Our custom application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      errorResponse(error.code, error.message)
    );
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(
      errorResponse('AUTHENTICATION_ERROR', 'Invalid token')
    );
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(
      errorResponse('AUTHENTICATION_ERROR', 'Token expired')
    );
  }

  // Default to 500 server error
  res.status(500).json(
    errorResponse(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : error.message
    )
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(
    errorResponse('NOT_FOUND_ERROR', `Route ${req.method} ${req.path} not found`)
  );
};