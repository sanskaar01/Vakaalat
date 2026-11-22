import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  role: 'client' | 'lawyer' | 'admin';
  stageName: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const getSecret = () => process.env.JWT_SECRET || 'vakaalat-dev-secret-kanpur-2026';

export function signToken(user: AuthUser): string {
  return jwt.sign(user, getSecret(), { expiresIn: '7d' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, getSecret()) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), getSecret()) as AuthUser;
    } catch {
      // ignore invalid optional token
    }
  }
  next();
}

export function requireRole(role: 'client' | 'lawyer' | 'admin') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: `Access restricted to ${role} accounts` });
      return;
    }
    next();
  };
}
