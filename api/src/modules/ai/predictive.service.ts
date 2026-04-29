import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class PredictiveService {
  private readonly logger = new Logger(PredictiveService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly db: DatabaseService,
  ) {}

  async generateInsight(tenantId: string, data: any) {
    this.logger.log(`Generating predictive insight for tenant ${tenantId}`);

    const prompt = `
      SISTEMA: Hub Predictivo AcuaCore AI.
      CONTEXTO: Análisis de parámetros en cultivo de camarón.
      DATOS ACTUALES: ${JSON.stringify(data)}
      
      TAREA:
      1. Identificar tendencias críticas (Oxígeno, Temperatura, Salinidad).
      2. Predecir riesgos biológicos (Hipoxia, Estrés Térmico, Patógenos).
      3. Dar 3 recomendaciones técnicas accionables.
      
      FORMATO: Texto profesional, directo, técnico. Máximo 150 palabras.
    `;

    try {
      const result = await this.aiService.generateResponse(prompt, []);
      return {
        insight: result.content,
        confidence: 0.94,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error generating insight: ${error.message}`);
      throw error;
    }
  }

  async analyzeConversation(messages: any[]) {
    const context = messages.slice(-5).map(m => `${m.role === 'user' ? 'CLIENTE' : 'AI'}: ${m.content}`).join('\n');
    
    const prompt = `
      SISTEMA: Analista de Conversaciones AcuaCore AI.
      CONVERSACIÓN RECIENTE:
      ${context}
      
      TAREA:
      Analiza la conversación y responde estrictamente en formato JSON con la siguiente estructura:
      {
        "sentiment": "Positivo" | "Neutral" | "Negativo",
        "intent": "Técnica" | "Soporte" | "Comercial" | "Urgencia",
        "summary": "Breve resumen de 1 oración",
        "suggestedResponse": "Sugerencia de respuesta profesional",
        "confidence": 0.XX (número entre 0 y 1)
      }
    `;

    try {
      const result = await this.aiService.generateResponse(prompt, []);
      // result is { content, confidence, isFlagged }
      const jsonStr = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(`Error analyzing conversation: ${error.message}`);
      return {
        sentiment: "Neutral",
        intent: "Soporte",
        summary: "Error al analizar la conversación.",
        suggestedResponse: "Lo siento, hubo un error al procesar el análisis.",
        confidence: 0.5
      };
    }
  }
}
