import { Controller, Post, Body, Request } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('workspace/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('ask')
  ask(@Request() req, @Body('question') question: string) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return this.aiService.ask(tenantId, userId, question);
  }
}
