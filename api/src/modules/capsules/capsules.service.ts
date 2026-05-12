import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
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

  async findAll(tenantId?: string, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    
    const where = (tenantId && !isSystem && !isGlobal) ? { tenantId } : {};
    
    console.log('CAPSULES QUERY:', { tenantId, isSystem, isGlobal, where });

    const results = await this.db.mysql.capsule.findMany({
      where,
      include: { 
        agent: true,
        _count: {
          select: { leads: true, campaigns: true }
        }
      },
    });

    console.log('CAPSULES RESULT:', results.length);
    return results;
  }

  async findOne(id: string, tenantId: string, user?: any) {
    console.log(`FIND_ONE: id="${id}" (length: ${id?.length}), tenantId=${tenantId}, userRole=${user?.role}`);
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    
    const where = (isSystem || isGlobal) ? { id: id.trim() } : { id: id.trim(), tenantId };
    console.log(`FIND_ONE WHERE: ${JSON.stringify(where)}`);
    
    const capsule = await this.db.mysql.capsule.findFirst({
      where,
      include: { agent: true },
    });
    
    if (!capsule) {
        console.log('FIND_ONE NOT FOUND IN DB');
        // Let's try to find it by ID only to be sure
        const debugCapsule = await this.db.mysql.capsule.findUnique({ where: { id: id.trim() } });
        console.log('DEBUG_FIND_BY_ID_ONLY:', debugCapsule ? 'FOUND' : 'NOT FOUND');
        
        throw new NotFoundException('Capsule not found');
    }
    return capsule;
  }

  async update(id: string, tenantId: string, dto: any, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    const where = (isSystem || isGlobal) ? { id } : { id, tenantId };

    this.logger.debug(`Updating capsule ${id}. Admin bypass: ${isSystem}`);
    return this.db.mysql.capsule.update({
      where,
      data: {
        ...dto,
        contentBlocks: dto.contentBlocks ? (dto.contentBlocks as any) : undefined,
        knowledgeIds: dto.knowledgeIds ? (dto.knowledgeIds as any) : undefined,
        promptConfig: dto.promptConfig ? (dto.promptConfig as any) : undefined,
        ctaConfig: dto.ctaConfig ? (dto.ctaConfig as any) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';

    const capsule = await this.db.mysql.capsule.findFirst({
      where: (isSystem || isGlobal) ? { id } : { id, tenantId },
      include: { campaigns: true }
    });

    if (!capsule) throw new NotFoundException('Cápsula no encontrada');

    if (!isSystem) {
      // Regla: No borrar si ya está publicada
      if (capsule.status.toUpperCase() === 'PUBLISHED') {
        throw new ConflictException('No se puede eliminar una cápsula que ya está publicada. Cámbiala a borrador primero.');
      }

      // Regla: No borrar si tiene campañas enviadas
      const hasSentCampaigns = capsule.campaigns.some(c => c.sentAt !== null);
      if (hasSentCampaigns) {
        throw new ConflictException('No se puede eliminar esta cápsula porque tiene campañas que ya fueron enviadas por correo.');
      }
    }

    return this.db.mysql.capsule.delete({
      where: { id },
    });
  }

  async findBySlug(slug: string, tenantId?: string, includeDrafts = false, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';

    const capsule = await this.db.mysql.capsule.findUnique({
      where: { slug },
      include: { agent: true, tenant: true },
    });

    if (!capsule) {
      throw new NotFoundException(`Capsule with slug ${slug} not found`);
    }

    // Si se especifica tenantId, validar pertenencia (excepto si es admin)
    if (tenantId && !(isSystem || isGlobal) && capsule.tenantId !== tenantId) {
      throw new NotFoundException(`Capsule with slug ${slug} not found for this tenant`);
    }

    // Validar status si no se permiten borradores
    if (!includeDrafts && capsule.status.toUpperCase() !== 'PUBLISHED') {
      throw new NotFoundException(`Esta cápsula no está disponible actualmente.`);
    }

    return capsule;
  }

  async updateStatus(id: string, tenantId: string, status: string, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    const where = (isSystem || isGlobal) ? { id } : { id, tenantId };

    return this.db.mysql.capsule.update({
      where,
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

  async chat(slug: string, body: any, tenantId?: string, includeDrafts = false, user?: any) {
    const { message, userId } = body;
    // Buscamos la cápsula primero para obtener su tenantId real si no viene en el header
    const capsule = await this.findBySlug(slug, tenantId, includeDrafts, user);
    const resolvedTenantId = tenantId || capsule.tenantId || 'DEFAULT_TENANT';
    const finalUserId = userId || 'anon-' + Date.now();

    // Handle via ConversationsService to ensure it appears in Bandeja
    const aiMessage = await this.conversationsService.handleIncomingMessage(
      finalUserId,
      message,
      resolvedTenantId,
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

  async getLeads(tenantId: string) {
    return this.db.mysql.lead.findMany({
      where: { 
        OR: [
          { tenantId },
          { capsule: { tenantId } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        capsule: true,
        campaign: true,
        conversation: true
      },
    });
  }

  async getLeadJourney(conversationId: string, tenantId: string) {
    const conversation = await this.db.mysql.conversation.findUnique({
      where: { id: conversationId },
      include: { 
        leads: {
          include: {
            campaign: true
          }
        }
      }
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const lead = conversation.leads[0];
    const timeline: any[] = [];

    // 1. Marketing events if lead exists
    if (lead) {
      // Creation
      timeline.push({
        type: 'LEAD_CREATED',
        title: 'Lead Registrado',
        description: `El lead se registró a través de la cápsula: ${(lead.metadata as any)?.capsuleTitle || 'General'}`,
        timestamp: lead.createdAt,
        metadata: lead.metadata
      });

      // Campaign Events
      if (lead.campaignId && lead.email) {
        const events = await this.db.mysql.campaignEvent.findMany({
          where: {
            campaignId: lead.campaignId,
            email: lead.email
          },
          orderBy: { createdAt: 'asc' }
        });

        events.forEach(event => {
          timeline.push({
            type: event.type === 'OPEN' ? 'EMAIL_OPEN' : 'EMAIL_CLICK',
            title: event.type === 'OPEN' ? 'Email Abierto' : 'Clic en Enlace',
            description: event.type === 'OPEN' 
              ? `Abrió el correo de la campaña: ${lead.campaign?.name}`
              : `Hizo clic en un enlace de la campaña: ${lead.campaign?.name}`,
            timestamp: event.createdAt,
            metadata: {
              ip: event.ip,
              userAgent: event.userAgent
            }
          });
        });
      }
    }

    // 2. Chat events
    timeline.push({
      type: 'CHAT_STARTED',
      title: 'Chat Iniciado',
      description: 'El usuario inició una conversación con el agente AI.',
      timestamp: conversation.createdAt
    });

    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}
