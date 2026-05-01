import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTenantId } from '../../common/tenant/tenant.middleware';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private activeModel: string = 'gemini-2.5-flash';

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

  async generateResponse(userMessage: string, history: any[] = [], modelName?: string, systemInstruction?: string, channel: string = 'whatsapp') {
    const selectedModel = modelName || this.activeModel;
    const tenantId = getTenantId();
    const globalRules = `REGLA CRÍTICA DE IDIOMA: Responde SIEMPRE en el mismo idioma que el usuario. Si el usuario habla español, NO uses términos en inglés como "DIAGNOSTIC", "ROOT CAUSE" o "ACTION PLAN". Usa exclusivamente sus equivalentes en español.
    
ADAPTACIÓN DE CANAL: Estás respondiendo a través de: ${channel.toUpperCase()}. 
- Si es WHATSAPP: Sé conciso, usa párrafos cortos y emojis si es apropiado.
- Si es WEB/APP: Sé más estructurado, usa negritas y listas si es necesario.
- Si es API: Entrega información técnica pura y directa.`;
    const basePersona = systemInstruction || `Eres AcuaCore AI, un asesor experto en acuacultura. Tu objetivo es proporcionar consejos precisos, técnicos y útiles.`;
    const activeSystemPrompt = `${basePersona}\n\n${globalRules}`;

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
      console.log(`[AiService] Generating response with model ${selectedModel}...`);
      const model = this.genAI.getGenerativeModel({ model: selectedModel });
      
      const result = await model.generateContent({
        contents: contents
      });

      const responseText = result.response.text();
      const confidence = this.calculateConfidence(responseText);

      // Track Cost (Simple simulation)
      await this.trackCost(tenantId, selectedModel, userMessage.length / 4, responseText.length / 4);

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

  async analyzeVision(imageUrl: string, prompt: string) {
    try {
      this.logger.log(`[AiService] Analyzing image from URL: ${imageUrl.substring(0, 50)}...`);
      const model = this.genAI.getGenerativeModel({ model: this.activeModel });
      
      let base64Data: string;
      let mimeType: string;

      if (imageUrl.startsWith('data:')) {
        const parts = imageUrl.split(',');
        base64Data = parts[1];
        mimeType = parts[0].split(';')[0].split(':')[1];
      } else {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        base64Data = Buffer.from(response.data).toString('base64');
        mimeType = (response.headers['content-type'] as string) || 'image/jpeg';
      }

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType
          }
        }
      ]);

      const responseText = result.response.text();
      return responseText;
    } catch (error) {
      this.logger.error(`[AiService] Error in analyzeVision: ${error.message}`);
      throw error;
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

  getActiveModel() {
    return this.activeModel;
  }

  setActiveModel(model: string) {
    this.logger.log(`[AiService] Switching global model to: ${model}`);
    this.activeModel = model;
    return { status: 'ok', model: this.activeModel };
  }
}
