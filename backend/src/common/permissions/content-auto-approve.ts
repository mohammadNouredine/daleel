import { UserRole } from '../enums';
import type { DaleelUser } from '../../modules/users/schemas/user.types';

/** ADMIN and ORGANIZATION publish content without moderation; USER/VOLUNTEER unchanged. */
export function shouldAutoApproveCreatedContent(user: DaleelUser): boolean {
  return (
    user.role === UserRole.ADMIN || user.role === UserRole.ORGANIZATION
  );
}
