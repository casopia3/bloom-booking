import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Delegates to JwtStrategy (auth/strategies/jwt.strategy.ts).
// Apply with @UseGuards(JwtAuthGuard) on any protected controller/route.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
