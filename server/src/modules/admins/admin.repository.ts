import { Types } from 'mongoose';
import { AdminModel } from './admin.model';
import { IAdmin, IAdminDocument } from './admin.types';

export class AdminRepository {
  public async findByEmail(email: string, includePassword = false): Promise<IAdminDocument | null> {
    const query = AdminModel.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  public async findById(id: string | Types.ObjectId, includeRefreshToken = false): Promise<IAdminDocument | null> {
    const query = AdminModel.findById(id);
    if (includeRefreshToken) {
      query.select('+refreshTokenHash');
    }
    return query.exec();
  }

  public async create(data: Partial<IAdmin>): Promise<IAdminDocument> {
    const admin = new AdminModel(data);
    return admin.save();
  }

  public async updateRefreshToken(adminId: string | Types.ObjectId, refreshTokenHash: string | null): Promise<void> {
    await AdminModel.findByIdAndUpdate(adminId, { refreshTokenHash });
  }

  public async updateLastLogin(adminId: string | Types.ObjectId): Promise<void> {
    await AdminModel.findByIdAndUpdate(adminId, { lastLoginAt: new Date() });
  }

  public async countAdmins(): Promise<number> {
    return AdminModel.countDocuments();
  }
}

export const adminRepository = new AdminRepository();
