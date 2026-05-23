export enum AdminSeedAction {
  NONE = 'NONE',
  PROMOTED_EXISTING = 'PROMOTED_EXISTING',
  SYNCED_AND_PROMOTED = 'SYNCED_AND_PROMOTED',
  CREATED = 'CREATED',
}

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

function collectErrorMessages(error: unknown, depth = 0): string[] {
  if (depth > 5 || error == null) return [];

  const messages: string[] = [];

  if (typeof error === 'string') {
    messages.push(error);
    return messages;
  }

  if (error instanceof Error) {
    messages.push(error.message);
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause) messages.push(...collectErrorMessages(cause, depth + 1));
  }

  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string') messages.push(obj.message);
    if (typeof obj.errmsg === 'string') messages.push(obj.errmsg);
    if (obj.cause) messages.push(...collectErrorMessages(obj.cause, depth + 1));
  }

  return messages;
}

function extractMongoCode(error: unknown, depth = 0): number | undefined {
  if (depth > 5 || error == null || typeof error !== 'object') return undefined;

  const obj = error as Record<string, unknown>;
  if (typeof obj.code === 'number') return obj.code;

  if (error instanceof Error && (error as Error & { cause?: unknown }).cause) {
    return extractMongoCode((error as Error & { cause?: unknown }).cause, depth + 1);
  }

  if (obj.cause) return extractMongoCode(obj.cause, depth + 1);

  return undefined;
}

export function classifySignUpError(error: unknown): {
  code: string;
  message: string;
  userAlreadyExists: boolean;
  dbCaseMismatch: boolean;
} {
  const messages = collectErrorMessages(error);
  const combined = messages.join(' | ');
  const mongoCode = extractMongoCode(error);
  const lower = combined.toLowerCase();

  return {
    code: mongoCode ? `MONGO_${mongoCode}` : 'AUTH_SIGNUP_FAILED',
    message: combined || 'Unknown sign-up error',
    userAlreadyExists:
      lower.includes('already exists') ||
      lower.includes('user already') ||
      lower.includes('duplicate'),
    dbCaseMismatch:
      mongoCode === 13297 || lower.includes('different case'),
  };
}
