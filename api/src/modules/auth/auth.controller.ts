import { Controller, Post, Body, Headers } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { Public } from '../../common/guards/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private db: DatabaseService) {}

  @Public()
  @Post('login-event')
  async logLoginEvent(
    @Body() body: { email: string; tenantId: string; role: string },
    @Headers('x-tenant-id') headerTenantId?: string
  ) {
    const tenantId = body.tenantId || headerTenantId;
    
    return this.db.logAction({
      tenantId: tenantId,
      userId: body.email,
      action: 'LOGIN',
      entity: 'USER',
      entityId: body.email,
      changes: {
        role: body.role,
        timestamp: new Date().toISOString()
      }
    });
  }
}
