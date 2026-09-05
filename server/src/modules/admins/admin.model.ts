import { Schema, model } from 'mongoose';
import { AdminRole, Permission, ROLE_DEFAULT_PERMISSIONS, ALL_PERMISSIONS } from '../../common/constants';
import { IAdminDocument } from './admin.types';

const adminSchema = new Schema<IAdminDocument>(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Never return password hash by default
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.STAFF,
      index: true,
    },
    customPermissions: {
      type: [String],
      enum: Object.values(Permission),
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.password;
        delete ret.refreshTokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method to calculate effective permissions
adminSchema.methods.effectivePermissions = function (): string[] {
  if (this.role === AdminRole.SUPER_ADMIN) {
    return ALL_PERMISSIONS;
  }
  const defaultPerms = ROLE_DEFAULT_PERMISSIONS[this.role as AdminRole] || [];
  const merged = new Set([...defaultPerms, ...(this.customPermissions || [])]);
  return Array.from(merged);
};

export const AdminModel = model<IAdminDocument>('Admin', adminSchema);
