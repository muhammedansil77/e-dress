import { AdminRole } from '../../common/constants';

export interface AdminAuthResponse {
  admin: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    permissions: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AdminProfileResponse {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
}
