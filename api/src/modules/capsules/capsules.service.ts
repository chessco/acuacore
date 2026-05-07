import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { AiService } from '../ai/ai.service';
import { CreateCapsuleDto } from './dto/create-capsule.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class CapsulesService {
  private readonly logger = new Logger(CapsulesService.name);

  constructor(
    private db: DatabaseService,
    private ai: AiService,
    private conversationsService: ConversationsService,
  ) {}

  async create(dto: CreateCapsuleDto) {
    return this.db.mysql.capsule.create({
      data: {
        ...dto,
        contentBlocks: dto.contentBlocks as any,
        knowledgeIds: dto.knowledgeIds as any,
        promptConfig: dto.promptConfig as any,
        ctaConfig: dto.ctaConfig as any,
      },
    });
  }

  async findAll(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    return this.db.mysql.capsule.findMany({
      where,
      include: { 
        agent: true,
        _count: {
          select: { leads: true }
        }
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const capsule = await this.db.mysql.capsule.findFirst({
      where: { id, tenantId },
      include: { agent: true },
    });
    if (!capsule) throw new NotFoundException('Capsule not found');
    return capsule;
  }

  async update(id: string, tenantId: string, dto: any) {
    this.logger.debug(`Updating capsule ${id} for tenant ${tenantId}. Data: ${JSON.stringify(dto)}`);
    return this.db.mysql.capsule.update({
      where: { id, tenantId },
      data: {
        ...dto,
        contentBlocks: dto.contentBlocks ? (dto.contentBlocks as any) : undefined,
        knowledgeIds: dto.knowledgeIds ? (dto.knowledgeIds as any) : undefined,
        promptConfig: dto.promptConfig ? (dto.promptConfig as any) : undefined,
        ctaConfig: dto.ctaConfig ? (dto.ctaConfig as any) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    return this.db.mysql.capsule.delete({
      where: { id, tenantId },
    });
  }

  async findBySlug(slug: string, checkPublished = true) {
    const capsule = await this.db.mysql.capsule.findUnique({
      where: { slug },
      include: { agent: true, tenant: true },
    });

    if (!capsule) {
      throw new NotFoundException(`Capsule with slug ${slug} not found`);
    }

    if (checkPublished && capsule.status.toUpperCase() !== 'PUBLISHED') {
      throw new NotFoundException(`Esta cápsula no está disponible actualmente.`);
    }

    return capsule;
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    return this.db.mysql.capsule.update({
      where: { id, tenantId },
      data: { status },
    });
  }

  async createLead(dto: CreateLeadDto & { userId?: string }) {
    const { userId, ...leadData } = dto;
    
    // Create the lead record
    const lead = await this.db.mysql.lead.create({
      data: leadData,
    });

    // If userId is provided, try to find and update the associated conversation
    if (userId) {
      const conversation = await this.db.mysql.conversation.findFirst({
        where: {
          OR: [
            { userId: userId },
            { externalId: userId }
          ]
        },
        include: { tenant: true }
      });

      if (conversation) {
        // Update conversation metadata with the lead's name
        const currentMetadata = (conversation.metadata as any) || {};
        const updatedMetadata = {
          ...currentMetadata,
          userName: dto.name,
          userEmail: dto.email,
          userPhone: dto.phone
        };

        const updatedConv = await this.db.mysql.conversation.update({
          where: { id: conversation.id },
          data: {
            metadata: updatedMetadata
          },
          include: { assignedTo: true }
        });

        // Notify inbox to update display name
        this.conversationsService.gateway.server
          .to(conversation.tenantId)
          .emit('conversationUpdate', updatedConv);
      }
    }

    return lead;
  }

  async chat(slug: string, message: string, userId?: string, history: any[] = []) {
    const capsule = await this.findBySlug(slug);
    const tenantId = capsule.tenantId || 'DEFAULT_TENANT';
    const finalUserId = userId || 'anon-' + Date.now();

    // Handle via ConversationsService to ensure it appears in Bandeja
    const aiMessage = await this.conversationsService.handleIncomingMessage(
      finalUserId,
      message,
      tenantId,
      undefined, // externalId
      undefined, // skills
      capsule.agent.slug,
      'capsule',
      { capsuleId: capsule.id, capsuleTitle: capsule.title }
    );

    return {
      content: aiMessage.content,
      role: 'assistant',
      capsuleId: capsule.id,
      conversationId: aiMessage.conversationId,
    };
  }

  async getAnalytics(tenantId?: string) {
    const filters = tenantId ? { tenantId } : {};
    
    const [totalCapsules, totalLeads, recentLeads] = await Promise.all([
      this.db.mysql.capsule.count({ where: filters }),
      this.db.mysql.lead.count({ where: { capsule: filters } }),
      this.db.mysql.lead.findMany({
        where: { capsule: filters },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { capsule: true },
      }),
    ]);

    return {
      totalCapsules,
      totalLeads,
      recentLeads,
      conversionRate: totalCapsules > 0 ? (totalLeads / (totalCapsules * 100)) : 0, // Mocked rate
    };
  }

  async getBranding(tenantId: string) {
    const tenant = await this.db.mysql.tenant.findUnique({
      where: { id: tenantId },
      select: { brandingConfig: true },
    });
    return tenant?.brandingConfig || {};
  }

  async updateBranding(tenantId: string, config: any) {
    return this.db.mysql.tenant.update({
      where: { id: tenantId },
      data: { brandingConfig: config },
    });
  }
}
