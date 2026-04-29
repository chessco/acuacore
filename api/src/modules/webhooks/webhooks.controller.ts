import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ConversationsService } from '../conversations/conversations.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private conversationsService: ConversationsService) {}

  @Post('flow/incoming')
  async handleFlowIncoming(
    @Headers('x-internal-key') internalKey: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() payload: { userId: string, content: string, externalId?: string }
  ) {
    if (internalKey !== (process.env.INTERNAL_API_KEY || 'pitaya_internal_dev_key')) {
      throw new UnauthorizedException('Invalid internal key');
    }

    // tenantId is handled by middleware, so we don't need to pass it explicitly to service
    // but we can log it
    console.log(`[Acuacore Webhook] Received message for tenant ${tenantId} from ${payload.userId}`);
    
    return this.conversationsService.handleIncomingMessage(
      payload.userId,
      payload.content,
      payload.externalId
    );
  }
}
