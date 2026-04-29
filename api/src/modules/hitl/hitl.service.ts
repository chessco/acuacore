import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { getTenantId } from '../../common/tenant/tenant.middleware';

@Injectable()
export class HitlService {
  constructor(private db: DatabaseService) {}

  async getPendingActions() {
    const tenantId = getTenantId();
    return this.db.mysql.hitlAction.findMany({
      where: { tenantId, status: 'PENDING' },
      include: { 
        message: {
          include: {
            conversation: true
          }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createAction(messageId: string, level: string = 'BIOLOGIST', comments?: string) {
    const tenantId = getTenantId();
    
    // Check if message exists
    let message = await this.db.mysql.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      // Create a placeholder message so the HITL system works even for unsynced Flow messages
      // We need a conversation first
      let conversation = await this.db.mysql.conversation.findFirst({
        where: { tenantId }
      });
      
      if (!conversation) {
        conversation = await this.db.mysql.conversation.create({
          data: { 
            userId: 'external-user',
            tenantId,
            externalId: 'flow-auto-sync'
          }
        });
      }

      message = await this.db.mysql.message.create({
        data: {
          id: messageId,
          conversationId: conversation.id,
          tenantId,
          role: 'user',
          content: 'Contenido no sincronizado (Ver en Flow)',
        }
      });
    }

    return this.db.mysql.hitlAction.create({
      data: {
        messageId,
        tenantId,
        level,
        status: 'PENDING',
        comments
      }
    });
  }

  async approve(actionId: string, reviewerId: string, editedContent?: string) {
    const tenantId = getTenantId();
    const action = await this.db.mysql.hitlAction.findUnique({
      where: { id: actionId },
    });

    if (!action || action.tenantId !== tenantId) {
      throw new Error('Action not found or unauthorized');
    }

    // Update message if edited
    if (editedContent) {
      await this.db.mysql.message.update({
        where: { id: action.messageId },
        data: { content: editedContent },
      });
    }

    // Update action status
    const updatedAction = await this.db.mysql.hitlAction.update({
      where: { id: actionId },
      data: {
        status: 'APPROVED',
        reviewerId,
        level: this.getNextLevel(action.level),
      },
    });

    // If it was the final level (DIRECTOR), we might want to update the KB
    if (action.level === 'DIRECTOR') {
      await this.syncToKnowledgeBase(action.messageId);
    }

    return updatedAction;
  }

  private getNextLevel(currentLevel: string): string {
    const levels = ['BIOLOGIST', 'ADVISOR', 'DIRECTOR'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'DIRECTOR';
  }

  private async syncToKnowledgeBase(messageId: string) {
    const message = await this.db.mysql.message.findUnique({
      where: { id: messageId },
    });
    
    if (message) {
      const entry = await this.db.mysql.knowledgeBase.create({
        data: {
          tenantId: message.tenantId,
          title: `HITL Correction: ${message.id}`,
          version: '1.0',
          source: `HITL_APPROVED_${messageId}`,
        },
      });

      await this.db.mysql.knowledgeBaseChunk.create({
        data: {
          kbId: entry.id,
          tenantId: message.tenantId,
          content: message.content,
          sequence: 0,
        },
      });
      
      // TODO: Update Vector store (PostgreSQL) here
    }
  }
}
