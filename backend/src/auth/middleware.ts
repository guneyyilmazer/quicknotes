import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from './jwt';

export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
    return;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
} 