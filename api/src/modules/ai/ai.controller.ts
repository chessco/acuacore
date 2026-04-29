import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { PredictiveService } from './predictive.service';
import { Public } from '../../common/guards/public.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly predictiveService: PredictiveService) {}

  @Post('predictive/insight')
  async getInsight(
    @Headers('x-tenant-id') tenantId: string,
    @Body() data: any,
  ) {
    return this.predictiveService.generateInsight(tenantId, data);
  }

  @Public()
  @Post('analyze-conversation')
  async analyze(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { messages: any[] }
  ) {
    return this.predictiveService.analyzeConversation(body.messages);
  }

  @Public()
  @Post('ping')
  async ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
