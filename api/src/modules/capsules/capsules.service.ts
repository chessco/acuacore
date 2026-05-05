import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { AiService } from '../ai/ai.service';
import { CreateCapsuleDto } from './dto/create-capsule.dto';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class CapsulesService {
  private readonly logger = new Logger(CapsulesService.name);

  constructor(
    private db: DatabaseService,
    private ai: AiService,
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
    if (tenantId) {
      return this.db.mysql.capsule.findMany({
        where: { tenantId },
        include: { agent: true },
      });
    }
    return this.db.mysql.capsule.findMany({
      include: { agent: true },
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

  async findBySlug(slug: string) {
    const capsule = await this.db.mysql.capsule.findUnique({
      where: { slug },
      include: { agent: true, tenant: true },
    });

    if (!capsule) {
      throw new NotFoundException(`Capsule with slug ${slug} not found`);
    }

    return capsule;
  }

  async createLead(dto: CreateLeadDto) {
    return this.db.mysql.lead.create({
      data: dto,
    });
  }

  async chat(slug: string, message: string, conversationId?: string, history: any[] = []) {
    const capsule = await this.findBySlug(slug);
    
    // 1. Prepare System Prompt with Strict Capsule context
    const capsuleContext = `
      ESTÁS ACTUANDO DENTRO DE UNA CÁPSULA DE CRECIMIENTO:
      TEMA: ${capsule.topic}
      CONOCIMIENTO ESPECÍFICO: ${capsule.description}
      
      REGLAS DE ORO:
      1. Mantén la conversación EXCLUSIVAMENTE sobre ${capsule.topic}.
      2. Si el usuario intenta hablar de otros temas, responde: "Como experto en ${capsule.topic}, prefiero que nos enfoquemos en optimizar esta área. ¿Tienes alguna duda específica sobre esto?"
      3. Proporciona datos técnicos y consejos accionables basados en el tema.
      4. Tu meta final es ayudar al usuario a entender el valor de optimizar ${capsule.topic} y animarlo a solicitar una asesoría personalizada.
      
      PERSONALIDAD DEL AGENTE (${capsule.agent.name}):
      ${capsule.agent.prompt}

      INSTRUCCIONES ADICIONALES DE LA CÁPSULA:
      ${(capsule.promptConfig as any)?.extraInstructions || ''}
    `;

    // 2. Generate response using AI Service
    const response = await this.ai.generateResponse(
      message, 
      history, 
      'gemini-2.5-flash', 
      capsuleContext, 
      'web'
    );

    // 3. Store conversation if needed
    // In a real flow, we'd ensure conversationId exists and link messages to it
    
    return {
      ...response,
      capsuleId: capsule.id,
      conversationId: conversationId || 'new-conv-' + Date.now(),
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
}
