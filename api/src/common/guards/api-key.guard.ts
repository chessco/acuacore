import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    const validApiKey = this.configService.get<string>('INTERNAL_API_KEY') || 'pitaya_internal_secret_2026';

    if (apiKey && apiKey === validApiKey) {
      // Mock a system user for the request if authenticated via API key
      request.user = {
        userId: 'system-api',
        email: 'system@acuacore.ai',
        role: 'SYSTEM_ADMIN'
      };
      return true;
    }

    return false;
  }
}
