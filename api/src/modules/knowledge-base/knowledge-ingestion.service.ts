import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class KnowledgeIngestionService {
  constructor(private db: DatabaseService) {}

  async ingestDocument(title: string, content: string, tenantId?: string) {
    // 1. Create Knowledge Base Entry
    const kb = await this.db.mysql.knowledgeBase.create({
      data: {
        title,
        tenantId,
        version: '1.0',
      },
    });

    // 2. Chunking Logic (Recursive character splitting simulation)
    const chunks = this.chunkContent(content, 1000);

    // 3. Store Chunks in MySQL
    for (let i = 0; i < chunks.length; i++) {
      await this.db.mysql.knowledgeBaseChunk.create({
        data: {
          kbId: kb.id,
          tenantId,
          content: chunks[i],
          sequence: i,
        },
      });
    }

    return { kbId: kb.id, chunkCount: chunks.length };
  }

  private chunkContent(content: string, size: number): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < content.length) {
      chunks.push(content.substring(start, start + size));
      start += size - 100; // 100 character overlap
    }
    return chunks;
  }
}
