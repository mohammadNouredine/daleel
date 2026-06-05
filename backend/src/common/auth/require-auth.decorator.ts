import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SessionAuthGuard } from './session-auth.guard';

export function RequireAuth() {
  return applyDecorators(UseGuards(SessionAuthGuard), ApiBearerAuth('bearer'));
}
