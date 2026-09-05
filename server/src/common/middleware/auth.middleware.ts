import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/app-error';
import { JwtUtils } from '../utils/jwt.utils';

export const authenticateAdmin = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check Authorization Header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Fallback to Cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please log in.');
    }

    // Verify token
    const decoded = JwtUtils.verifyAccessToken(token);
    req.admin = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
