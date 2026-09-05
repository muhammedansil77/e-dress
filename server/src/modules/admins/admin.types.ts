import { Document, Types } from 'mongoose';
import { AdminRole, Permission } from '../../common/constants';

export interface IAdmin {
  name: string;
  email: string;
  password?: string;
  role: AdminRole;
  customPermissions: Permission[];
  isActive: boolean;
  refreshTokenHash?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminDocument extends IAdmin, Document<Types.ObjectId> {
  effectivePermissions(): string[];
}
