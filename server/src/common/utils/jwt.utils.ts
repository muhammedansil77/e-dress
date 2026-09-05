import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.config';
import { AdminRole } from '../constants/roles';

export interface JwtAdminPayload {
  adminId: string;
  email: string;
  role: AdminRole;
  permissions: string[];
}

export class JwtUtils {
  public static generateAccessToken(payload: JwtAdminPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  public static generateRefreshToken(payload: { adminId: string; email: string }): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

  public static verifyAccessToken(token: string): JwtAdminPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAdminPayload;
  }

  public static verifyRefreshToken(token: string): { adminId: string; email: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { adminId: string; email: string };
  }
}
