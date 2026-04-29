import { Injectable } from '@nestjs/common';
import { AiService } from './ai.service';
import { DatabaseService } from '../../common/database/database.service';
import { getTenantId } from '../../common/tenant/tenant.middleware';

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
  constructor(
    private ai: AiService,
    private db: DatabaseService,
  ) {}

  async route(userInput: string, tenantIdParam?: string): Promise<RouterResponse> {
    const tenantId = tenantIdParam || getTenantId();

    // 1. Check for FAQ (Static) - Cost: $0
    const faq = await this.checkFaq(userInput, tenantId);
    if (faq) {
      return { decision: RouterDecision.STATIC, content: faq.content, cost: 0, confidence: 1.0, isFlagged: false };
    }

    // 2. Classify Complexity - Cost: Very Low (Gemini Flash)
    const classification = await this.classifyComplexity(userInput);

    // 3. Route based on complexity
    if (classification.complexity === 'low') {
      const response = await this.ai.generateResponse(userInput, [], 'gemini-1.5-flash');
      return { decision: RouterDecision.CHEAP, ...response };
    }

    if (classification.complexity === 'technical') {
      // 4. Use RAG - Cost: Moderate
      return { decision: RouterDecision.RAG, ...await this.handleRAG(userInput, tenantId) };
    }

    if (classification.complexity === 'critical') {
      // 5. Escalate to Premium or Human
      return { decision: RouterDecision.PREMIUM, ...await this.ai.generateResponse(userInput, [], 'gemini-1.5-pro') };
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

  private async classifyComplexity(input: string) {
    // Using a very small prompt to classify
    const prompt = `Classify the complexity of this aquaculture query: "${input}". 
    Options: low (greetings, simple info), technical (diseases, water parameters), critical (emergencies, high-value loss).
    Return JSON: { "complexity": "low" | "technical" | "critical" }`;
    
    const result = await this.ai.generateRaw(prompt, 'gemini-1.5-flash');
    try {
      return JSON.parse(result);
    } catch {
      return { complexity: 'technical' }; // Default to technical for safety
    }
  }

  private async handleRAG(input: string, tenantId: string) {
    // 1. Load Persona (Don Juan Camaron)
    const skill = await this.db.mysql.skill.findFirst({
      where: { name: { contains: 'Don Juan' } },
    });

    const persona = skill?.prompt || 'Eres un asesor técnico experto en acuacultura.';

    // 2. Retrieve context from Chunks
    const chunks = await this.db.mysql.knowledgeBaseChunk.findMany({
      where: {
        OR: [{ tenantId }, { tenantId: null }],
        content: { contains: input.split(' ')[0] },
      },
      take: 3,
    });

    const context = chunks.map((c: any) => c.content).join('\n---\n');
    const fullPrompt = `${persona}\n\nCONTEXTO TÉCNICO:\n${context}\n\nPREGUNTA DEL USUARIO: ${input}`;
    
    return await this.ai.generateResponse(fullPrompt, [], 'gemini-1.5-flash');
  }
}
