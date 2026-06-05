import { createAuthMiddleware } from 'better-auth/api';
import type { BetterAuthPlugin } from 'better-auth';

const WRAPPED_AUTH_PATHS = new Set([
  '/sign-in/email',
  '/sign-up/email',
  '/request-password-reset',
  '/reset-password',
  '/change-password',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function apiResponseWrapPlugin(): BetterAuthPlugin {
  return {
    id: 'api-response-wrap',
    hooks: {
      after: [
        {
          matcher: (ctx) => WRAPPED_AUTH_PATHS.has(ctx.path ?? ''),
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.returned;
            if (!isRecord(returned) || 'data' in returned) {
              return;
            }

            const message =
              typeof returned.message === 'string'
                ? returned.message
                : ctx.path === '/reset-password'
                  ? 'Password reset successfully'
                  : ctx.path === '/change-password'
                    ? 'Password updated successfully'
                    : '';

            return ctx.json({
              data: returned,
              message,
            });
          }),
        },
      ],
    },
  };
}
