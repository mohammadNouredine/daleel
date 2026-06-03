import { UserRole } from '../enums';
import type {
  PropertyPermissions,
  UserPermissions,
} from '../../modules/users/schemas/user.types';

export type PropertyPermissionKey = keyof PropertyPermissions;

const ALL_PROPERTY_PERMISSIONS: PropertyPermissions = {
  canViewProperties: true,
  canEditProperty: true,
  canDeleteProperty: true,
  canHideProperty: true,
  canApproveProperty: true,
  canRejectProperty: true,
};

const NO_PROPERTY_PERMISSIONS: PropertyPermissions = {
  canViewProperties: false,
  canEditProperty: false,
  canDeleteProperty: false,
  canHideProperty: false,
  canApproveProperty: false,
  canRejectProperty: false,
};

export function defaultPropertyPermissionsForRole(
  role: UserRole,
): PropertyPermissions {
  switch (role) {
    case UserRole.ADMIN:
      return { ...ALL_PROPERTY_PERMISSIONS };
    case UserRole.ORGANIZATION:
      return {
        ...NO_PROPERTY_PERMISSIONS,
        canViewProperties: true,
        canEditProperty: true,
      };
    default:
      return { ...NO_PROPERTY_PERMISSIONS };
  }
}

export function hasPropertyPermission(
  permissions: UserPermissions | undefined,
  action: PropertyPermissionKey,
): boolean {
  return permissions?.properties?.[action] === true;
}
