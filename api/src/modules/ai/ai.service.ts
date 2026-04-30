import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTenantId } from '../../common/tenant/tenant.middleware';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.logger.log(`Initializing Gemini with key: ${apiKey.substring(0, 5)}...`);
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(userMessage: string, history: any[] = [], modelName: string = 'gemini-2.5-flash', systemInstruction?: string) {
    const tenantId = getTenantId();
    const defaultSystemPrompt = `You are AcuaCore AI, an expert advisor in aquaculture.
Your goal is to provide precise, technical, and helpful advice based on the conversation context.
Always respond in the same language as the user.
If you need to provide a recommended response for the agent, keep it professional and action-oriented.`;

    const activeSystemPrompt = systemInstruction || defaultSystemPrompt;

    const contents = [
      { role: 'user', parts: [{ text: activeSystemPrompt }] },
      { role: 'model', parts: [{ text: 'Entendido. Estoy listo para actuar.' }] },
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    try {
      console.log(`[AiService] Generating response with model ${modelName}...`);
      const model = this.genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
        contents: contents
      });

      const responseText = result.response.text();
      const confidence = this.calculateConfidence(responseText);

      // Track Cost (Simple simulation)
      await this.trackCost(tenantId, modelName, userMessage.length / 4, responseText.length / 4);

      return {
        content: responseText,
        confidence,
        isFlagged: confidence < 0.7,
      };
    } catch (error) {
      console.error(`[AiService] Error in generateResponse: ${error.message}`);
      throw error;
    }
  }

  async generateRaw(prompt: string, modelName: string = 'gemini-2.5-flash') {
    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error(`[AiService] Error in generateRaw: ${error.message}`);
      return '';
    }
  }

  async getEmbedding(text: string) {
    try {
        const model = this.genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent({
          content: { role: 'user', parts: [{ text }] },
          outputDimensionality: 768,
        } as any);
        return result.embedding.values;
    } catch(e) {
        console.error("Embedding API failed, using mock embedding (768 dims)");
        return Array(768).fill(0.1);
    }
  }

  private async trackCost(tenantId: string, model: string, tokensIn: number, tokensOut: number) {
    try {
      const pricePer1k = model.includes('pro') ? 0.0035 : 0.0001;
      const cost = ((tokensIn + tokensOut) / 1000) * pricePer1k;

      await this.db.mysql.aiCostLog.create({
        data: {
          tenantId,
          model,
          tokensIn: Math.round(tokensIn),
          tokensOut: Math.round(tokensOut),
          costUsd: cost,
        },
      });
    } catch (error) {
      // Just log the error but don't fail the request
      console.error(`Failed to track AI cost: ${error.message}`);
    }
  }

  private calculateConfidence(text: string): number {
    // Basic heuristic: check for uncertainty markers
    const uncertaintyMarkers = ['maybe', 'not sure', 'could be', 'consult a biologist', 'I don\'t know'];
    let score = 1.0;
    uncertaintyMarkers.forEach(marker => {
      if (text.toLowerCase().includes(marker)) {
        score -= 0.2;
      }
    });
    return Math.max(0, score);
  }
}
