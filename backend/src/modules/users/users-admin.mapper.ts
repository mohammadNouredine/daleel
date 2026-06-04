import type { DaleelUser } from './schemas/user.types';

export type AdminUserResponse = {
  _id: string;
  fullName: string;
  email: string;
  role: DaleelUser['role'];
  permissions: DaleelUser['permissions'];
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function mapUserToAdminResponse(user: DaleelUser): AdminUserResponse {
  return {
    _id: user._id,
    fullName: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}
