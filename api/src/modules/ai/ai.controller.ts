import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { PredictiveService } from './predictive.service';

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

  @Post('analyze-conversation')
  async analyze(@Body() body: { messages: any[] }) {
    return this.predictiveService.analyzeConversation(body.messages);
  }
}
