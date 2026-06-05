import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionAuthGuard } from './session-auth.guard';

function createContext(session: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ session }),
    }),
  } as ExecutionContext;
}

describe('SessionAuthGuard', () => {
  const guard = new SessionAuthGuard();

  it('allows requests with a valid session user id', () => {
    expect(
      guard.canActivate(
        createContext({ user: { id: 'user-1' }, session: { id: 's1' } }),
      ),
    ).toBe(true);
  });

  it('rejects missing session', () => {
    expect(() => guard.canActivate(createContext(null))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects session without user id', () => {
    expect(() => guard.canActivate(createContext({ user: {} }))).toThrow(
      UnauthorizedException,
    );
  });
});
