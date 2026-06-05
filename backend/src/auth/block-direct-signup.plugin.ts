import { createAuthMiddleware } from 'better-auth/api';
import { APIError } from '@better-auth/core/error';
import type { BetterAuthPlugin } from 'better-auth';

const INTERNAL_SIGNUP_HEADER = 'x-daleel-internal-signup';

export function blockDirectSignupPlugin(): BetterAuthPlugin {
  return {
    id: 'block-direct-signup',
    hooks: {
      before: [
        {
          matcher: (ctx) => ctx.path === '/sign-up/email',
          handler: createAuthMiddleware((ctx) =>
            Promise.resolve().then(() => {
              const secret =
                process.env.INTERNAL_SIGNUP_SECRET ??
                process.env.BETTER_AUTH_SECRET;
              const internalHeader = ctx.headers?.get(INTERNAL_SIGNUP_HEADER);

              if (secret && internalHeader === secret) {
                return;
              }

              throw new APIError('FORBIDDEN', {
                message:
                  'Direct sign-up is disabled. Complete email verification first.',
              });
            }),
          ),
        },
      ],
    },
  };
}

export { INTERNAL_SIGNUP_HEADER };
