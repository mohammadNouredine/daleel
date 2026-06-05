import { UserRole, VerificationStatus } from '../enums';
import type { DaleelUser } from '../../modules/users/schemas/user.types';
import { defaultPermissionsForRole } from './default-role-permissions';
import {
  canAccessResource,
  getModerationQueueScope,
  isOwner,
} from './access-control';

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

describe('access-control', () => {
  describe('isOwner', () => {
    it('matches ownerId', () => {
      expect(isOwner('abc', { ownerId: 'abc' })).toBe(true);
    });

    it('matches createdBy when ownerId is absent', () => {
      expect(isOwner('abc', { createdBy: 'abc' })).toBe(true);
    });
  });

  describe('canAccessResource', () => {
    it('allows owner edit without requests.edit when allowOwnerWithoutPermission is true', () => {
      const user = buildUser(UserRole.USER);

      expect(
        canAccessResource(user, user._id, 'helpRequest', 'requests.edit', {
          resource: { createdBy: user._id },
          allowOwnerWithoutPermission: true,
        }),
      ).toBe(true);
    });

    it('denies non-owner without permission', () => {
      const user = buildUser(UserRole.USER);

      expect(
        canAccessResource(user, user._id, 'helpRequest', 'requests.edit', {
          resource: { createdBy: 'other-user' },
          allowOwnerWithoutPermission: true,
        }),
      ).toBe(false);
    });
  });

  describe('getModerationQueueScope', () => {
    it('grants platform scope to admin for help requests', () => {
      const admin = buildUser(UserRole.ADMIN);

      expect(getModerationQueueScope(admin, 'helpRequest')).toBe('platform');
    });

    it('denies regular users help request moderation', () => {
      const user = buildUser(UserRole.USER);

      expect(getModerationQueueScope(user, 'helpRequest')).toBe('none');
    });
  });
});
