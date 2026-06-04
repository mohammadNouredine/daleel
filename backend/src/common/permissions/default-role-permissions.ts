import { UserRole } from '../enums';
import type {
  RequestPermissions,
  UserPermissions,
} from '../../modules/users/schemas/user.types';
import { defaultPropertyPermissionsForRole } from './property-permissions';
import { defaultUserAdminPermissionsForRole } from './user-admin-permissions';

export function defaultRequestPermissionsForRole(
  role: UserRole,
): RequestPermissions {
  switch (role) {
    case UserRole.ADMIN:
      return {
        read: true,
        write: true,
        edit: true,
        verify: true,
        manage: true,
        delete: true,
      };
    case UserRole.VOLUNTEER:
      return {
        read: true,
        write: true,
        edit: true,
        verify: true,
        manage: false,
        delete: false,
      };
    case UserRole.ORGANIZATION:
      return {
        read: true,
        write: true,
        edit: true,
        verify: false,
        manage: false,
        delete: false,
      };
    default:
      return {
        read: true,
        write: true,
        edit: false,
        verify: false,
        manage: false,
        delete: false,
      };
  }
}

export function defaultPermissionsForRole(role: UserRole): UserPermissions {
  return {
    requests: defaultRequestPermissionsForRole(role),
    properties: defaultPropertyPermissionsForRole(role),
    users: defaultUserAdminPermissionsForRole(role),
  };
}

export function hasRequestPermission(
  permissions: UserPermissions | undefined,
  action: keyof RequestPermissions,
): boolean {
  return permissions?.requests?.[action] === true;
}
