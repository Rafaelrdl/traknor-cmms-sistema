import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '@/utils/auth';
import { AuthenticationError, AuthorizationError } from '@/utils/errors';
import { errorResponse } from '@/utils/response';
import prisma from '@/config/database';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        errorResponse('AUTHENTICATION_ERROR', 'Access token required')
      );
    }
    
    const token = authHeader.substring(7);
    
    const payload = verifyToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });
    
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json(
        errorResponse('AUTHENTICATION_ERROR', 'Invalid or inactive user')
      );
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
    next();
  } catch (error) {
    return res.status(401).json(
      errorResponse('AUTHENTICATION_ERROR', 'Invalid or expired token')
    );
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(
        errorResponse('AUTHENTICATION_ERROR', 'Authentication required')
      );
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse('AUTHORIZATION_ERROR', 'Insufficient permissions')
      );
    }
    
    next();
  };
};

// Optional authentication - user might be null
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });
    
    if (user && user.status === 'ACTIVE') {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};