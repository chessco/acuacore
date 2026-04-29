import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { AiService } from '../ai/ai.service';
import { AiRouterService } from '../ai/ai-router.service';
import { getTenantId } from '../../common/tenant/tenant.middleware';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConversationsGateway } from './conversations.gateway';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private db: DatabaseService,
    private aiRouter: AiRouterService,
    private httpService: HttpService,
    private gateway: ConversationsGateway,
  ) {}

  async handleIncomingMessage(userId: string, content: string, tenantIdParam?: string, externalId?: string, skills?: any) {
    const tenantId = tenantIdParam || getTenantId();

    // 1. Find or create conversation
    let conversation = await this.db.mysql.conversation.findFirst({
      where: { userId, tenantId },
    });

    if (!conversation) {
      conversation = await this.db.mysql.conversation.create({
        data: { userId, tenantId, externalId },
      });
    }

    // 2. Save user message
    const savedUserMessage = await this.db.mysql.message.create({
      data: {
        conversationId: conversation.id,
        tenantId,
        role: 'user',
        content,
      },
    });
    
    // 2. Emit via Socket.io (Silent failure if gateway not ready)
    try {
      this.gateway.emitNewMessage(tenantId, savedUserMessage);
    } catch (e) {
      console.warn('Gateway emit failed:', e.message);
    }

    // 3. Generate AI response via Router (Cost Optimized)
    let aiResult;
    try {
      aiResult = await this.aiRouter.route(content, tenantId, skills);
    } catch (e) {
      console.error('AI Routing failed:', e.message);
      return savedUserMessage; // Return at least the user message
    }

    // 4. Save AI message
    const savedAiMessage = await this.db.mysql.message.create({
      data: {
        conversationId: conversation.id,
        tenantId,
        role: 'assistant',
        content: aiResult.content,
        confidence: aiResult.confidence || 1.0,
        isFlagged: aiResult.isFlagged || false,
        classification: aiResult.decision, // Store routing decision
      },
    });
    
    // Emit AI message to frontend
    this.gateway.emitNewMessage(tenantId, savedAiMessage);

    // 5. If flagged or routed to human, create HITL action
    this.logger.log(`AI Decision: ${aiResult.decision} | isFlagged: ${aiResult.isFlagged}`);
    
    if (aiResult.isFlagged || aiResult.decision === 'HUMAN') {
      this.logger.log(`Creating HITL action for message ${savedAiMessage.id}`);
      await this.db.mysql.hitlAction.create({
        data: {
          messageId: savedAiMessage.id,
          tenantId,
          level: 'BIOLOGIST',
          status: 'PENDING',
        },
      });
    } else {
      // Send AI Response to Flow
      try {
        const flowApiUrl = process.env.FLOW_API_URL || 'http://localhost:3003';
        const internalKey = process.env.INTERNAL_API_KEY || 'pitaya_internal_dev_key';
        
        this.logger.log(`Forwarding AI response to Flow: ${flowApiUrl}/whatsapp/internal/send`);
        const response = await firstValueFrom(
          this.httpService.post(`${flowApiUrl}/whatsapp/internal/send`, {
            tenantId,
            to: userId,
            content: aiResult.content,
            key: internalKey
          })
        );
        this.logger.log(`Successfully sent AI response to Flow. Status: ${response.status}`);
      } catch (error) {
        this.logger.error(`Failed to send response to Flow: ${error.message}`);
        if (error.response) {
          this.logger.error(`Flow API responded with: ${JSON.stringify(error.response.data)}`);
        }
      }
    }

    return savedAiMessage;
  }

  async getConversations() {
    const tenantId = getTenantId();
    return this.db.mysql.conversation.findMany({
      where: { tenantId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMessages(conversationId: string) {
    const tenantId = getTenantId();
    return this.db.mysql.message.findMany({
      where: { conversationId, tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }
}


