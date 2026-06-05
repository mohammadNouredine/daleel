import { ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PropertyListingStatus, UserRole, VerificationStatus } from '../../../common/enums';
import { defaultPermissionsForRole } from '../../../common/permissions/default-role-permissions';
import type { DaleelUser } from '../../users/schemas/user.types';
import type { PropertyListingDocument } from '../schemas/property-listing.schema';
import { PropertyListingPolicy } from './property-listing.policy';

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
  overrides: Partial<PropertyListingDocument> = {},
): PropertyListingDocument {
  return {
    ownerId: new Types.ObjectId('507f1f77bcf86cd799439011'),
    status: PropertyListingStatus.APPROVED,
    deletedAt: null,
    ...overrides,
  } as PropertyListingDocument;
}

describe('PropertyListingPolicy', () => {
  const policy = new PropertyListingPolicy();

  describe('assertCanListForAdmin', () => {
    it('returns platform scope for admin', () => {
      const admin = buildUser(UserRole.ADMIN);

      expect(policy.assertCanListForAdmin(admin)).toBe('platform');
    });

    it('denies regular users', () => {
      const user = buildUser(UserRole.USER);

      expect(() => policy.assertCanListForAdmin(user)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('assertCanEdit', () => {
    it('allows organization owner without explicit edit permission flag', () => {
      const owner = buildUser(UserRole.ORGANIZATION, { _id: 'owner-1' });
      const doc = buildDoc({
        ownerId: { toHexString: () => 'owner-1' } as PropertyListingDocument['ownerId'],
      });

      expect(() => policy.assertCanEdit(owner, 'owner-1', doc)).not.toThrow();
    });

    it('denies non-owner without permission', () => {
      const user = buildUser(UserRole.USER, { _id: 'other-user' });
      const doc = buildDoc();

      expect(() => policy.assertCanEdit(user, 'other-user', doc)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('canView', () => {
    it('allows public view of approved listing', () => {
      const user = buildUser(UserRole.USER, { _id: 'viewer' });
      const doc = buildDoc({
        status: PropertyListingStatus.APPROVED,
        deletedAt: null,
      });

      expect(policy.canView(user, 'viewer', doc)).toBe(true);
    });

    it('allows owner to view draft listing', () => {
      const owner = buildUser(UserRole.ORGANIZATION, { _id: 'owner-1' });
      const doc = buildDoc({
        status: PropertyListingStatus.DRAFT,
        ownerId: { toHexString: () => 'owner-1' } as PropertyListingDocument['ownerId'],
      });

      expect(policy.canView(owner, 'owner-1', doc)).toBe(true);
    });
  });

  describe('assertPropertyPermission', () => {
    it('allows admin approve permission', () => {
      const admin = buildUser(UserRole.ADMIN);

      expect(() =>
        policy.assertPropertyPermission(admin, 'canApproveProperty'),
      ).not.toThrow();
    });
  });
});
