import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTenantId } from '../../common/tenant/tenant.middleware';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateResponse(userMessage: string, history: any[] = [], modelName: string = 'gemini-1.5-flash') {
    const tenantId = getTenantId();
    const model = this.genAI.getGenerativeModel({ model: modelName });
    
    const tenant = await this.db.mysql.tenant.findUnique({
      where: { id: tenantId },
    });

    const systemPrompt = `You are AcuaCore AI...`; // System instructions

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();
    const confidence = this.calculateConfidence(responseText);

    // Track Cost (Simple simulation)
    await this.trackCost(tenantId, modelName, userMessage.length / 4, responseText.length / 4);

    return {
      content: responseText,
      confidence,
      isFlagged: confidence < 0.7,
    };
  }

  async generateRaw(prompt: string, modelName: string = 'gemini-1.5-flash') {
    const model = this.genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async trackCost(tenantId: string, model: string, tokensIn: number, tokensOut: number) {
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
