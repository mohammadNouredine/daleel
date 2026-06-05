import { ForbiddenException } from '@nestjs/common';

export function assertPolicy(
  condition: boolean,
  message = 'Insufficient permissions',
): asserts condition {
  if (!condition) {
    throw new ForbiddenException(message);
  }
}
