import { UserRole } from '../enums';
import type {
  DaleelUser,
  PropertyPermissions,
  RequestPermissions,
  UserAdminPermissions,
  UserPermissions,
} from '../../modules/users/schemas/user.types';
import type { PermissionPath } from './permission-catalog';
import { resolveEffectivePermissions } from './effective-permissions';
import { hasPropertyPermission } from './property-permissions';
import { hasRequestPermission } from './default-role-permissions';
import { hasUserAdminPermission } from './user-admin-permissions';

export type AccessScope = 'platform' | 'own' | 'none';

export type ResourceType = 'helpRequest' | 'property' | 'user';

export type OwnableResource = {
  ownerId?: string;
  createdBy?: string;
};

function getEffective(user: DaleelUser): UserPermissions {
  return resolveEffectivePermissions(user);
}

export function hasPermission(user: DaleelUser, path: PermissionPath): boolean {
  const effective = getEffective(user);
  const [group, key] = path.split('.') as [string, string];

  switch (group) {
    case 'requests':
      return hasRequestPermission(effective, key as keyof RequestPermissions);
    case 'properties':
      return hasPropertyPermission(effective, key as keyof PropertyPermissions);
    case 'users':
      return hasUserAdminPermission(
        effective,
        key as keyof UserAdminPermissions,
      );
    default:
      return false;
  }
}

export function isOwner(userId: string, resource: OwnableResource): boolean {
  const owner = resource.ownerId ?? resource.createdBy;
  return owner != null && owner === userId;
}

const PROPERTY_MODERATION_KEYS: (keyof PropertyPermissions)[] = [
  'canApproveProperty',
  'canRejectProperty',
];

export function canModerate(
  user: DaleelUser,
  resourceType: ResourceType,
): boolean {
  const effective = getEffective(user);
  switch (resourceType) {
    case 'helpRequest':
      return hasRequestPermission(effective, 'verify');
    case 'property':
      return PROPERTY_MODERATION_KEYS.some((key) =>
        hasPropertyPermission(effective, key),
      );
    default:
      return false;
  }
}

/** Scope for property directory listing (admin dashboard table). */
export function getPropertyListScope(user: DaleelUser): AccessScope {
  if (!hasPropertyPermission(getEffective(user), 'canViewProperties')) {
    return 'none';
  }
  if (user.role === UserRole.ADMIN) {
    return 'platform';
  }
  if (user.role === UserRole.ORGANIZATION) {
    return 'own';
  }
  return 'none';
}

/** Scope for moderation queues (all pending items). */
export function getModerationQueueScope(
  user: DaleelUser,
  resourceType: 'helpRequest' | 'property',
): AccessScope {
  if (resourceType === 'helpRequest') {
    return hasRequestPermission(getEffective(user), 'verify')
      ? 'platform'
      : 'none';
  }
  if (canModerate(user, 'property')) {
    return 'platform';
  }
  return 'none';
}

export function getScope(
  user: DaleelUser,
  resourceType: ResourceType,
  permissionPath: PermissionPath,
): AccessScope {
  if (!hasPermission(user, permissionPath)) {
    return 'none';
  }

  if (user.role === UserRole.ADMIN) {
    return 'platform';
  }

  if (resourceType === 'helpRequest' && permissionPath === 'requests.verify') {
    return 'platform';
  }

  if (
    resourceType === 'property' &&
    (permissionPath === 'properties.canApproveProperty' ||
      permissionPath === 'properties.canRejectProperty')
  ) {
    return 'platform';
  }

  if (resourceType === 'user') {
    return 'platform';
  }

  if (user.role === UserRole.ORGANIZATION) {
    return 'own';
  }

  return 'own';
}

export type CanAccessResourceContext = {
  resource?: OwnableResource;
  /** When true, owner can access without the permission flag (public my-content flows). */
  allowOwnerWithoutPermission?: boolean;
};

export function canAccessResource(
  user: DaleelUser,
  userId: string,
  resourceType: ResourceType,
  permissionPath: PermissionPath,
  context: CanAccessResourceContext = {},
): boolean {
  const scope = getScope(user, resourceType, permissionPath);
  if (scope === 'none') {
    if (
      context.allowOwnerWithoutPermission &&
      context.resource &&
      isOwner(userId, context.resource)
    ) {
      return true;
    }
    return false;
  }

  if (scope === 'platform') {
    return true;
  }

  if (context.resource && isOwner(userId, context.resource)) {
    return true;
  }

  return false;
}
