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

  async handleIncomingMessage(userId: string, content: string, tenantIdParam?: string, externalId?: string, skills?: any, agentSlug?: string, channel: string = 'whatsapp') {
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
      aiResult = await this.aiRouter.route(content, tenantId, skills, agentSlug, channel);
      
      // Security Trim: Meta/WhatsApp limit is 4096. We clip at 4000 for safety.
      if (aiResult.content && aiResult.content.length > 4000) {
        this.logger.warn(`AI response truncated from ${aiResult.content.length} to 4000 chars.`);
        aiResult.content = aiResult.content.substring(0, 4000);
      }
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
        const flowApiUrl = process.env.FLOW_API_URL || 'https://flow-api.pitayacode.io';
        const internalKey = process.env.INTERNAL_API_KEY;
        
        if (!internalKey) {
          throw new Error('INTERNAL_API_KEY not defined in environment');
        }
        
        this.logger.log(`[Flow Forward] Sending response to ${userId} via Flow...`);
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
        assignedTo: {
          select: { id: true, name: true, role: true, email: true }
        },
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

  async getOperators(tenantId?: string) {
    const tid = tenantId || getTenantId();
    return this.db.mysql.user.findMany({
      where: { 
        tenantId: tid,
        role: 'OPERATOR' 
      },
      select: { id: true, name: true, role: true }
    });
  }

  async assignToOperator(conversationId: string, operatorId: string, userId?: string) {
    const tenantId = getTenantId();
    
    const updated = await this.db.mysql.conversation.upsert({
      where: { id: conversationId },
      update: { 
        assignedToId: operatorId,
        tenantId // Ensure tenantId is correct
      },
      create: {
        id: conversationId,
        tenantId,
        userId: userId || 'unknown',
        assignedToId: operatorId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    // Notify via socket
    this.gateway.server.to(tenantId).emit('conversationUpdate', updated);

    return updated;
  }
}


