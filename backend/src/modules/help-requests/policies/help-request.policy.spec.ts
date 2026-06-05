import { ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserRole, VerificationStatus } from '../../../common/enums';
import {
  HelpRequestApprovalStatus,
  HelpRequestStatus,
} from '../../../common/enums';
import { defaultPermissionsForRole } from '../../../common/permissions/default-role-permissions';
import type { DaleelUser } from '../../users/schemas/user.types';
import type { HelpRequestDocument } from '../schemas/help-request.schema';
import { HelpRequestPolicy } from './help-request.policy';

function buildUser(
  role: UserRole,
  overrides: Partial<DaleelUser> = {},
): DaleelUser {
  return {
    _id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role,
    permissions: defaultPermissionsForRole(role),
    isVerified: false,
    verificationStatus: VerificationStatus.UNVERIFIED,
    isActive: true,
    ...overrides,
  };
}

function buildDoc(
  overrides: Partial<HelpRequestDocument> = {},
): HelpRequestDocument {
  return {
    createdBy: new Types.ObjectId('507f1f77bcf86cd799439011'),
    approvalStatus: HelpRequestApprovalStatus.APPROVED,
    status: HelpRequestStatus.ACTIVE,
    ...overrides,
  } as HelpRequestDocument;
}

describe('HelpRequestPolicy', () => {
  const policy = new HelpRequestPolicy();

  describe('assertCanEdit', () => {
    it('allows owner without requests.edit permission', () => {
      const user = buildUser(UserRole.USER, { _id: 'owner-1' });
      const doc = buildDoc({
        createdBy: new Types.ObjectId('507f1f77bcf86cd799439011'),
      });

      expect(() =>
        policy.assertCanEdit(user, 'owner-1', {
          ...doc,
          createdBy: { toHexString: () => 'owner-1' } as HelpRequestDocument['createdBy'],
        }),
      ).not.toThrow();
    });

    it('denies non-owner without permission', () => {
      const user = buildUser(UserRole.USER, { _id: 'other-user' });
      const doc = buildDoc();

      expect(() => policy.assertCanEdit(user, 'other-user', doc)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('assertCanManage', () => {
    it('allows owner on active request', () => {
      const user = buildUser(UserRole.USER, { _id: 'owner-1' });
      const doc = buildDoc({
        status: HelpRequestStatus.ACTIVE,
        createdBy: { toHexString: () => 'owner-1' } as HelpRequestDocument['createdBy'],
      });

      expect(() => policy.assertCanManage(user, 'owner-1', doc)).not.toThrow();
    });

    it('rejects manage on cancelled request', () => {
      const user = buildUser(UserRole.ADMIN);
      const doc = buildDoc({ status: HelpRequestStatus.CANCELLED });

      expect(() => policy.assertCanManage(user, user._id, doc)).toThrow(
        /not manageable/i,
      );
    });
  });

  describe('assertCanVerify', () => {
    it('allows admin verifier', () => {
      const admin = buildUser(UserRole.ADMIN);

      expect(() => policy.assertCanVerify(admin)).not.toThrow();
    });

    it('denies regular user', () => {
      const user = buildUser(UserRole.USER);

      expect(() => policy.assertCanVerify(user)).toThrow(ForbiddenException);
    });
  });

  describe('canView', () => {
    it('allows anyone to view approved requests', () => {
      const user = buildUser(UserRole.USER, { _id: 'viewer' });
      const doc = buildDoc({
        approvalStatus: HelpRequestApprovalStatus.APPROVED,
      });

      expect(policy.canView(user, 'viewer', doc)).toBe(true);
    });
  });
});
