import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { getRequestSession } from './request-session.util';

function requireSession(context: ExecutionContext): UserSession {
  const session = getRequestSession(context);

  if (!session?.user?.id) {
    throw new UnauthorizedException('Authentication required');
  }

  return session;
}

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    return requireSession(context).user.id;
  },
);

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserSession => {
    return requireSession(context);
  },
);
