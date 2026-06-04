import { UserRole } from '../enums';
import type { UserAdminPermissions } from '../../modules/users/schemas/user.types';

export type UserAdminPermissionKey = keyof UserAdminPermissions;

const ALL_USER_ADMIN_PERMISSIONS: UserAdminPermissions = {
  read: true,
  edit: true,
  delete: true,
  managePermissions: true,
};

const NO_USER_ADMIN_PERMISSIONS: UserAdminPermissions = {
  read: false,
  edit: false,
  delete: false,
  managePermissions: false,
};

export function defaultUserAdminPermissionsForRole(
  role: UserRole,
): UserAdminPermissions {
  switch (role) {
    case UserRole.ADMIN:
      return { ...ALL_USER_ADMIN_PERMISSIONS };
    default:
      return { ...NO_USER_ADMIN_PERMISSIONS };
  }
}

export function hasUserAdminPermission(
  permissions: { users?: UserAdminPermissions } | undefined,
  action: UserAdminPermissionKey,
): boolean {
  return permissions?.users?.[action] === true;
}
