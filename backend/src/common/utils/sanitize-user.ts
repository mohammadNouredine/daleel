import type { DaleelUser } from '../../modules/users/schemas/user.types';

export function sanitizeUser(user: DaleelUser) {
  return {
    _id: user._id,
    fullName: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    phoneNumber: user.phoneNumber,
    whatsappNumber: user.whatsappNumber,
    profileImage: user.profileImage ?? user.image,
    isVerified: user.isVerified,
    verificationStatus: user.verificationStatus,
    location: user.location,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
