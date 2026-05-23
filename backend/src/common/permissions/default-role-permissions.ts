import { UserRole } from '../enums';
import type {
  RequestPermissions,
  UserPermissions,
} from '../../modules/users/schemas/user.types';

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
      };
    case UserRole.VOLUNTEER:
      return {
        read: true,
        write: true,
        edit: true,
        verify: true,
        manage: false,
      };
    case UserRole.ORGANIZATION:
      return {
        read: true,
        write: true,
        edit: true,
        verify: false,
        manage: false,
      };
    default:
      return {
        read: true,
        write: true,
        edit: false,
        verify: false,
        manage: false,
      };
  }
}

export function defaultPermissionsForRole(role: UserRole): UserPermissions {
  return {
    requests: defaultRequestPermissionsForRole(role),
  };
}

export function hasRequestPermission(
  permissions: UserPermissions | undefined,
  action: keyof RequestPermissions,
): boolean {
  return permissions?.requests?.[action] === true;
}
