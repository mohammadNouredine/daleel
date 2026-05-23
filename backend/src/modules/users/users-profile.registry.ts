import { UserRole } from '../../common/enums';

type ProfileSetupHandler = (_id: string, role: UserRole) => Promise<void>;

let setupHandler: ProfileSetupHandler | null = null;

export function registerUserProfileSetup(handler: ProfileSetupHandler): void {
  setupHandler = handler;
}

export async function runUserProfileSetup(
  _id: string,
  role: UserRole = UserRole.USER,
): Promise<void> {
  if (!setupHandler) return;
  await setupHandler(_id, role);
}
