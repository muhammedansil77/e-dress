import { adminRepository } from '../admins/admin.repository';
import { PasswordUtils } from '../../common/utils/password.utils';
import { JwtUtils } from '../../common/utils/jwt.utils';
import { UnauthorizedError } from '../../common/errors/app-error';
import { AdminLoginInput } from './auth.validation';
import { AdminAuthResponse, AdminProfileResponse } from './auth.types';

export class AuthService {
  public async loginAdmin(input: AdminLoginInput): Promise<AdminAuthResponse> {
    const admin = await adminRepository.findByEmail(input.email, true);

    if (!admin) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact Super Admin.');
    }

    const isPasswordValid = await PasswordUtils.compare(input.password, admin.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const permissions = admin.effectivePermissions();

    const accessToken = JwtUtils.generateAccessToken({
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions,
    });

    const refreshToken = JwtUtils.generateRefreshToken({
      adminId: admin._id.toString(),
      email: admin.email,
    });

    // Hash refresh token before persisting to DB
    const refreshTokenHash = await PasswordUtils.hash(refreshToken);
    await adminRepository.updateRefreshToken(admin._id, refreshTokenHash);
    await adminRepository.updateLastLogin(admin._id);

    return {
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  public async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { adminId: string; email: string };
    try {
      payload = JwtUtils.verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const admin = await adminRepository.findById(payload.adminId, true);
    if (!admin || !admin.isActive || !admin.refreshTokenHash) {
      throw new UnauthorizedError('Invalid refresh token session');
    }

    const isMatching = await PasswordUtils.compare(token, admin.refreshTokenHash);
    if (!isMatching) {
      // Possible token reuse attack - clear token hash
      await adminRepository.updateRefreshToken(admin._id, null);
      throw new UnauthorizedError('Token reuse detected. Please log in again.');
    }

    const permissions = admin.effectivePermissions();

    const newAccessToken = JwtUtils.generateAccessToken({
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions,
    });

    const newRefreshToken = JwtUtils.generateRefreshToken({
      adminId: admin._id.toString(),
      email: admin.email,
    });

    const newHash = await PasswordUtils.hash(newRefreshToken);
    await adminRepository.updateRefreshToken(admin._id, newHash);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async logoutAdmin(adminId: string): Promise<void> {
    await adminRepository.updateRefreshToken(adminId, null);
  }

  public async getProfile(adminId: string): Promise<AdminProfileResponse> {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw new UnauthorizedError('Admin user not found');
    }

    return {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.effectivePermissions(),
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    };
  }
}

export const authService = new AuthService();
