import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getRequestSession } from './request-session.util';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const session = getRequestSession(context);

    if (!session?.user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
