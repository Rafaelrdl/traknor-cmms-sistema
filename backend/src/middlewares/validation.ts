import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/utils/errors';
import { errorResponse } from '@/utils/response';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          errorResponse(
            'VALIDATION_ERROR',
            'Invalid request data',
            error.errors
          )
        );
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          errorResponse(
            'VALIDATION_ERROR',
            'Invalid request parameters',
            error.errors
          )
        );
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          errorResponse(
            'VALIDATION_ERROR',
            'Invalid query parameters',
            error.errors
          )
        );
      }
      next(error);
    }
  };
};