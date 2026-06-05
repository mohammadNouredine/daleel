import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserSession } from '@thallesp/nestjs-better-auth';

type RequestWithSession = Request & {
  session?: UserSession | null;
};

export function getRequestSession(
  context: ExecutionContext,
): UserSession | null | undefined {
  const request = context.switchToHttp().getRequest<RequestWithSession>();
  return request.session;
}
