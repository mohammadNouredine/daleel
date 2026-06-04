import { UserRole, VerificationStatus } from '../../../common/enums';

export interface RequestPermissions {
  read: boolean;
  write: boolean;
  edit: boolean;
  verify: boolean;
  manage: boolean;
  delete: boolean;
}

export interface PropertyPermissions {
  canViewProperties: boolean;
  canEditProperty: boolean;
  canDeleteProperty: boolean;
  canHideProperty: boolean;
  canApproveProperty: boolean;
  canRejectProperty: boolean;
  canPermanentlyDeleteProperty: boolean;
}

export interface UserAdminPermissions {
  read: boolean;
  edit: boolean;
  delete: boolean;
  managePermissions: boolean;
}

export interface UserPermissions {
  requests: RequestPermissions;
  properties: PropertyPermissions;
  users: UserAdminPermissions;
}

export interface UserLocation {
  governorate?: string;
  district?: string;
  city?: string;
}

/** User document in the `users` collection. `_id` is the only user reference. */
export interface DaleelUser {
  _id: string;
  email: string;
  name: string;
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  role: UserRole;
  permissions: UserPermissions;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  profileImage?: string | null;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  location?: UserLocation;
  isActive: boolean;
  lastLoginAt?: Date | null;
}

export const USERS_COLLECTION = 'users';
