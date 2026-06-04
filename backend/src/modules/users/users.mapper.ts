import { ObjectId } from 'mongodb';
import { UserRole, VerificationStatus } from '../../common/enums';
import { defaultPermissionsForRole } from '../../common/permissions';
import type { DaleelUser } from './schemas/user.types';

export function mapDocumentToUser(record: Record<string, unknown>): DaleelUser | null {
  if (!(record._id instanceof ObjectId) || typeof record.email !== 'string') {
    return null;
  }

  const role =
    typeof record.role === 'string' &&
    Object.values(UserRole).includes(record.role as UserRole)
      ? (record.role as UserRole)
      : UserRole.USER;

  const stored = record.permissions as DaleelUser['permissions'] | undefined;
  const defaults = defaultPermissionsForRole(role);
  const permissions: DaleelUser['permissions'] = {
    requests: { ...defaults.requests, ...stored?.requests },
    properties: { ...defaults.properties, ...stored?.properties },
    users: { ...defaults.users, ...stored?.users },
  };

  return {
    _id: record._id.toHexString(),
    email: record.email,
    name: typeof record.name === 'string' ? record.name : record.email,
    emailVerified: record.emailVerified === true,
    image: typeof record.image === 'string' ? record.image : null,
    createdAt: record.createdAt instanceof Date ? record.createdAt : undefined,
    updatedAt: record.updatedAt instanceof Date ? record.updatedAt : undefined,
    role,
    permissions,
    phoneNumber: typeof record.phoneNumber === 'string' ? record.phoneNumber : null,
    whatsappNumber:
      typeof record.whatsappNumber === 'string' ? record.whatsappNumber : null,
    profileImage: typeof record.profileImage === 'string' ? record.profileImage : null,
    isVerified: record.isVerified === true,
    verificationStatus:
      typeof record.verificationStatus === 'string' &&
      Object.values(VerificationStatus).includes(
        record.verificationStatus as VerificationStatus,
      )
        ? (record.verificationStatus as VerificationStatus)
        : VerificationStatus.UNVERIFIED,
    location: record.location as DaleelUser['location'] | undefined,
    isActive: record.isActive !== false,
    lastLoginAt: record.lastLoginAt instanceof Date ? record.lastLoginAt : null,
  };
}
