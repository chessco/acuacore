import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeyGuard: ApiKeyGuard,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // 1. Try API Key authentication first
    const isApiKeyValid = await this.apiKeyGuard.canActivate(context);
    if (isApiKeyValid) {
      return true;
    }

    // 2. Simple JWT check (placeholder until full JwtStrategy is implemented)
    // For now, if x-api-key is missing, we check for Authorization header
    // In a production app, this would use Passport's JwtAuthGuard
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Mock validation for now to allow development flow
      request.user = {
        userId: 'dev-user',
        email: 'dev@acuacore.ai',
        role: 'USER'
      };
      return true;
    }

    return false;
  }
}
