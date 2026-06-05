import { Injectable } from '@nestjs/common';
import {
  assertPolicy,
  canAccessResource,
  getModerationQueueScope,
  getScope,
  hasPermission,
} from '../../../common/permissions';
import {
  HelpRequestApprovalStatus,
  HelpRequestStatus,
} from '../../../common/enums';
import type { DaleelUser } from '../../users/schemas/user.types';
import type { HelpRequestDocument } from '../schemas/help-request.schema';

@Injectable()
export class HelpRequestPolicy {
  assertCanReadMine(user: DaleelUser): void {
    assertPolicy(hasPermission(user, 'requests.read'));
  }

  assertCanAccessModerationQueue(user: DaleelUser): void {
    assertPolicy(getModerationQueueScope(user, 'helpRequest') !== 'none');
  }

  assertCanWrite(user: DaleelUser): void {
    assertPolicy(hasPermission(user, 'requests.write'));
  }

  assertCanVerify(user: DaleelUser): void {
    assertPolicy(hasPermission(user, 'requests.verify'));
  }

  canView(
    user: DaleelUser,
    userId: string,
    doc: HelpRequestDocument,
  ): boolean {
    if (doc.approvalStatus === HelpRequestApprovalStatus.APPROVED) {
      return true;
    }

    return canAccessResource(user, userId, 'helpRequest', 'requests.read', {
      resource: { createdBy: doc.createdBy.toHexString() },
      allowOwnerWithoutPermission: true,
    });
  }

  assertCanEdit(
    user: DaleelUser,
    userId: string,
    doc: HelpRequestDocument,
  ): void {
    assertPolicy(
      canAccessResource(user, userId, 'helpRequest', 'requests.edit', {
        resource: { createdBy: doc.createdBy.toHexString() },
        allowOwnerWithoutPermission: true,
      }),
      'Not allowed to edit this request',
    );
  }

  assertCanDelete(
    user: DaleelUser,
    userId: string,
    doc: HelpRequestDocument,
  ): void {
    assertPolicy(
      canAccessResource(user, userId, 'helpRequest', 'requests.delete', {
        resource: { createdBy: doc.createdBy.toHexString() },
        allowOwnerWithoutPermission: true,
      }),
      'Not allowed to delete this request',
    );
  }

  assertCanManage(
    user: DaleelUser,
    userId: string,
    doc: HelpRequestDocument,
  ): void {
    const manageableStatuses = [
      HelpRequestStatus.ACTIVE,
      HelpRequestStatus.PARTIALLY_FULFILLED,
    ];

    assertPolicy(
      manageableStatuses.includes(doc.status),
      'Request is not manageable in this status',
    );

    const manageScope = getScope(user, 'helpRequest', 'requests.manage');
    const isOwner = doc.createdBy.toHexString() === userId;

    if (manageScope === 'platform' || isOwner) {
      return;
    }

    assertPolicy(
      hasPermission(user, 'requests.manage'),
      'Not allowed to manage this request',
    );
  }
}
