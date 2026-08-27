import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from './jwt';
import { UnauthorizedError, ForbiddenError } from './errors';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError());
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError('Token invalid or expired'));
  }
};

export const requireRole = (role: 'admin' | 'student') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return next(new ForbiddenError());
    }
    next();
  };
};