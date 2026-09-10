import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Usage: @CurrentUser() user: AuthenticatedUser
 * Populated by JwtStrategy.validate() — see auth/strategies/jwt.strategy.ts
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
