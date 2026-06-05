import { Injectable } from '@nestjs/common';
import {
  assertPolicy,
  canAccessResource,
  getModerationQueueScope,
  getPropertyListScope,
  hasPermission,
  type AccessScope,
} from '../../../common/permissions';
import type { PropertyPermissionKey } from '../../../common/permissions/property-permissions';
import { PropertyListingStatus } from '../../../common/enums';
import type { DaleelUser } from '../../users/schemas/user.types';
import type { PropertyListingDocument } from '../schemas/property-listing.schema';

@Injectable()
export class PropertyListingPolicy {
  getAdminListScope(user: DaleelUser): AccessScope {
    return getPropertyListScope(user);
  }

  assertCanListForAdmin(user: DaleelUser): AccessScope {
    const listScope = getPropertyListScope(user);
    assertPolicy(listScope !== 'none');
    return listScope;
  }

  assertCanAccessModerationQueue(user: DaleelUser): void {
    assertPolicy(getModerationQueueScope(user, 'property') !== 'none');
    assertPolicy(
      hasPermission(user, 'properties.canApproveProperty') ||
        hasPermission(user, 'properties.canRejectProperty'),
    );
  }

  assertCanListHidden(user: DaleelUser): void {
    assertPolicy(
      hasPermission(user, 'properties.canHideProperty') ||
        hasPermission(user, 'properties.canPermanentlyDeleteProperty'),
    );
  }

  assertPropertyPermission(
    user: DaleelUser,
    action: PropertyPermissionKey,
  ): void {
    assertPolicy(hasPermission(user, `properties.${action}`));
  }

  canView(
    user: DaleelUser,
    userId: string,
    doc: PropertyListingDocument,
  ): boolean {
    const resource = { ownerId: doc.ownerId.toHexString() };
    const isOwner = resource.ownerId === userId;
    const isPubliclyVisible =
      !doc.deletedAt && doc.status === PropertyListingStatus.APPROVED;

    if (isPubliclyVisible) {
      return true;
    }

    if (
      canAccessResource(
        user,
        userId,
        'property',
        'properties.canViewProperties',
        {
          resource,
          allowOwnerWithoutPermission: true,
        },
      )
    ) {
      if (getPropertyListScope(user) === 'platform') {
        return true;
      }
      return isOwner;
    }

    return isOwner;
  }

  assertCanEdit(
    user: DaleelUser,
    userId: string,
    doc: PropertyListingDocument,
  ): void {
    assertPolicy(
      canAccessResource(
        user,
        userId,
        'property',
        'properties.canEditProperty',
        {
          resource: { ownerId: doc.ownerId.toHexString() },
          allowOwnerWithoutPermission: true,
        },
      ),
      'Not allowed to modify this listing',
    );
  }

  assertCanHide(
    user: DaleelUser,
    userId: string,
    doc: PropertyListingDocument,
  ): void {
    assertPolicy(
      canAccessResource(
        user,
        userId,
        'property',
        'properties.canHideProperty',
        {
          resource: { ownerId: doc.ownerId.toHexString() },
          allowOwnerWithoutPermission: true,
        },
      ),
      'Not allowed to hide this listing',
    );
  }

  assertCanDelete(
    user: DaleelUser,
    userId: string,
    doc: PropertyListingDocument,
  ): void {
    assertPolicy(
      canAccessResource(
        user,
        userId,
        'property',
        'properties.canDeleteProperty',
        {
          resource: { ownerId: doc.ownerId.toHexString() },
          allowOwnerWithoutPermission: true,
        },
      ),
      'Not allowed to delete this listing',
    );
  }

  assertCanPermanentlyDelete(
    user: DaleelUser,
    userId: string,
    doc: PropertyListingDocument,
  ): void {
    assertPolicy(
      canAccessResource(
        user,
        userId,
        'property',
        'properties.canPermanentlyDeleteProperty',
        {
          resource: { ownerId: doc.ownerId.toHexString() },
          allowOwnerWithoutPermission: true,
        },
      ),
      'Not allowed to permanently delete this listing',
    );
  }
}
