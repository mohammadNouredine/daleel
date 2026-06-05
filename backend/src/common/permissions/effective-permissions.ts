import { UserRole } from '../enums';
import type {
  DaleelUser,
  PropertyPermissions,
  RequestPermissions,
  UserAdminPermissions,
  UserPermissions,
} from '../../modules/users/schemas/user.types';
import { defaultPermissionsForRole } from './default-role-permissions';

function mergeRequestPermissions(
  defaults: RequestPermissions,
  stored?: Partial<RequestPermissions>,
): RequestPermissions {
  return { ...defaults, ...stored };
}

function mergePropertyPermissions(
  defaults: PropertyPermissions,
  stored?: Partial<PropertyPermissions>,
): PropertyPermissions {
  return { ...defaults, ...stored };
}

function mergeUserAdminPermissions(
  defaults: UserAdminPermissions,
  stored?: Partial<UserAdminPermissions>,
): UserAdminPermissions {
  return { ...defaults, ...stored };
}

/** Stored permissions override role defaults (per-field). */
export function resolveEffectivePermissions(user: DaleelUser): UserPermissions {
  const defaults = defaultPermissionsForRole(user.role);
  const stored = user.permissions;

  return {
    requests: mergeRequestPermissions(defaults.requests, stored?.requests),
    properties: mergePropertyPermissions(
      defaults.properties,
      stored?.properties,
    ),
    users: mergeUserAdminPermissions(defaults.users, stored?.users),
  };
}

export function getRoleDefaultPermissions(role: UserRole): UserPermissions {
  return defaultPermissionsForRole(role);
}
