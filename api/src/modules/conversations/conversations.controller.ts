import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async getConversations() {
    return this.conversationsService.getConversations();
  }

  @Get('operators')
  async getOperators() {
    return this.conversationsService.getOperators();
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.conversationsService.getMessages(id);
  }

  @Patch(':id/assign')
  async assign(@Param('id') id: string, @Body() body: { operatorId: string, userId?: string }) {
    return this.conversationsService.assignToOperator(id, body.operatorId, body.userId);
  }
}
