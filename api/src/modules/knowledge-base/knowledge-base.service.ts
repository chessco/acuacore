import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { getTenantId } from '../../common/tenant/tenant.middleware';

@Injectable()
export class KnowledgeBaseService {
  constructor(private db: DatabaseService) {}

  async addEntry(content: string, source?: string) {
    const tenantId = getTenantId();

    // 1. Save to MySQL
    const entry = await this.db.mysql.knowledgeBase.create({
      data: {
        tenantId,
        title: source || 'Untitled Entry',
        source,
        version: '1.0',
      },
    });

    // 2. Save Chunk
    await this.db.mysql.knowledgeBaseChunk.create({
      data: {
        kbId: entry.id,
        tenantId,
        content: content,
        sequence: 0,
      },
    });

    // 3. Generate and save embedding in PostgreSQL
    const embedding = await this.generateMockEmbedding(content);
    
    // Using raw query for pgvector since Prisma Support is limited for Vector type
    await this.db.postgres.$executeRawUnsafe(
      `INSERT INTO "VectorRecord" ("id", "tenantId", "content", "embedding", "refId", "refType") 
       VALUES (gen_random_uuid(), '${tenantId}', '${content.replace(/'/g, "''")}', '[${embedding.join(',')}]', '${entry.id}', 'KB')`
    );

    return entry;
  }

  async search(query: string, limit: number = 5) {
    const tenantId = getTenantId();
    const queryEmbedding = await this.generateMockEmbedding(query);

    // Vector similarity search using pgvector
    const results = await this.db.postgres.$queryRawUnsafe(
      `SELECT "content", "refId", "refType", ("embedding" <=> '[${queryEmbedding.join(',')}]') as distance 
       FROM "VectorRecord" 
       WHERE "tenantId" = '${tenantId}'
       ORDER BY distance ASC 
       LIMIT ${limit}`
    );

    return results;
  }

  private async generateMockEmbedding(text: string): Promise<number[]> {
    // Mock 1536-dimensional vector
    const vector = new Array(1536).fill(0).map(() => Math.random());
    return vector;
  }
}
