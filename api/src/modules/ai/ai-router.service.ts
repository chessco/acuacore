import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { DatabaseService } from '../../common/database/database.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { getTenantId } from '../../common/tenant/tenant.middleware';
import { AgentsService } from '../agents/agents.service';

export enum RouterDecision {
  STATIC = 'STATIC',
  CHEAP = 'CHEAP',
  RAG = 'RAG',
  PREMIUM = 'PREMIUM',
  HUMAN = 'HUMAN',
}

export interface RouterResponse {
  decision: RouterDecision;
  content: string;
  cost?: number;
  confidence: number;
  isFlagged: boolean;
}

@Injectable()
export class AiRouterService {
  private readonly logger = new Logger(AiRouterService.name);

  constructor(
    private ai: AiService,
    private db: DatabaseService,
    private kb: KnowledgeBaseService,
    private agentsService: AgentsService,
  ) {}

  async route(userInput: string, tenantIdParam?: string, skills?: any, agentSlug?: string, channel: string = 'whatsapp'): Promise<RouterResponse> {
    const tenantId = tenantIdParam || getTenantId();
    console.log(`[AiRouter] Routing message. Skills received:`, skills);
    
    // 0. Check for Human Correction (Manual override) - Priority 1
    const correction = await this.checkHumanCorrection(userInput, tenantId);
    if (correction) {
      this.logger.log(`[AiRouter] Human Correction found for: ${userInput}`);
      return { decision: RouterDecision.STATIC, content: correction.response, cost: 0, confidence: 1.0, isFlagged: false };
    }

    // 0. Fetch recent history for context
    const history = await this.db.mysql.message.findMany({
      where: { 
        tenantId,
      },
      orderBy: { createdAt: 'desc' },
      take: 6, // Last 3 turns
    });
    const formattedHistory = history.reverse();

    // 1. Check for FAQ (Static) - Cost: $0
    const faq = await this.checkFaq(userInput, tenantId);
    if (faq) {
      return { decision: RouterDecision.STATIC, content: faq.content, cost: 0, confidence: 1.0, isFlagged: false };
    }

    // 2. Classify Complexity
    const classification = await this.classifyComplexity(userInput);

    // 3. Route based on complexity
    if (classification.complexity === 'low') {
      const response = await this.ai.generateResponse(userInput, formattedHistory, 'gemini-2.5-flash', undefined, channel);
      return { decision: RouterDecision.CHEAP, ...response };
    }

    if (classification.complexity === 'technical') {
      return { decision: RouterDecision.RAG, ...await this.handleRAG(userInput, tenantId, skills, formattedHistory, agentSlug, channel) };
    }

    if (classification.complexity === 'critical') {
      return { decision: RouterDecision.PREMIUM, ...await this.ai.generateResponse(userInput, formattedHistory, 'gemini-2.5-flash', undefined, channel) };
    }

    return { decision: RouterDecision.HUMAN, content: 'Escalating to a technical advisor.', isFlagged: true, confidence: 1.0 };
  }

  private async checkFaq(input: string, tenantId: string) {
    // Simple exact match or high-score full-text search for simulation
    return await this.db.mysql.knowledgeBaseChunk.findFirst({
      where: {
        tenantId,
        content: { contains: input }, // In reality, use Full-text index or high-threshold similarity
      },
    });
  }

  private async checkHumanCorrection(input: string, tenantId: string) {
    return await this.db.mysql.humanCorrection.findFirst({
      where: {
        tenantId,
        isActive: true,
        trigger: { contains: input },
      },
    });
  }

  private async classifyComplexity(input: string) {
    // Using a very small prompt to classify
    const prompt = `Classify the complexity of this aquaculture query: "${input}". 
    Options: low (greetings, simple info), technical (diseases, water parameters), critical (emergencies, high-value loss).
    Return JSON: { "complexity": "low" | "technical" | "critical" }`;
    
    const result = await this.ai.generateRaw(prompt, 'gemini-2.5-flash');
    try {
      return JSON.parse(result);
    } catch {
      return { complexity: 'technical' }; // Default to technical for safety
    }
  }

  private async handleRAG(input: string, tenantId: string, skills?: any, history: any[] = [], agentSlug?: string, channel: string = 'whatsapp') {
    // 1. Load Agent Persona
    let persona = `Eres AcuaCore AI, un asesor experto en acuacultura.`;
    
    if (agentSlug) {
      const agent = await this.agentsService.findBySlug(agentSlug, tenantId);
      if (agent) {
        this.logger.log(`[AiRouter] Using Agent: ${agent.name}`);
        persona = agent.prompt;
      } else {
        this.logger.warn(`[AiRouter] Agent slug '${agentSlug}' provided but not found. Using default persona.`);
      }
    } else if (skills?.don_juan_camaron) {
        // Fallback para retrocompatibilidad
        const donJuan = await this.agentsService.findBySlug('don-juan', tenantId);
        persona = donJuan?.prompt || persona;
    }

    // 2. SEMANTIC SEARCH (RAG 2.0)
    let context = '';
    try {
      const results = await this.kb.search(input, 3) as any[];
      context = results.map((r: any) => r.content).join('\n---\n');
      console.log(`[AiRouter] Semantic search found ${results.length} relevant chunks.`);
    } catch (e) {
      this.logger.error(`Semantic search failed: ${e.message}`);
    }

    const userPrompt = context 
      ? `BASÁNDOTE EN ESTA INFORMACIÓN TÉCNICA:\n${context}\n\nRESPONDE A ESTA CONSULTA: ${input}`
      : input;
    
    return await this.ai.generateResponse(userPrompt, history, 'gemini-2.5-flash', persona, channel);
  }
}
