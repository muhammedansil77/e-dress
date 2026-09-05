import '../../common/types/express';
import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { UnauthorizedError } from '../../common/errors/app-error';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export class AuthController {
  public login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.loginAdmin(req.body);

    // Set HTTP-only refresh token cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set access token cookie as well for easy client hydration
    res.cookie('accessToken', result.tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    return ApiResponse.success(res, result, 'Admin logged in successfully');
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      throw new UnauthorizedError('Refresh token required');
    }

    const tokens = await authService.refreshToken(token);

    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    return ApiResponse.success(res, tokens, 'Tokens refreshed successfully');
  });

  public logout = asyncHandler(async (req: Request, res: Response) => {
    if (req.admin?.adminId) {
      await authService.logoutAdmin(req.admin.adminId);
    }

    res.clearCookie('refreshToken', { path: '/' });
    res.clearCookie('accessToken', { path: '/' });

    return ApiResponse.success(res, null, 'Logged out successfully');
  });

  public getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.admin?.adminId) {
      throw new UnauthorizedError('Authentication required');
    }

    const profile = await authService.getProfile(req.admin.adminId);
    return ApiResponse.success(res, profile, 'Profile retrieved successfully');
  });
}

export const authController = new AuthController();
