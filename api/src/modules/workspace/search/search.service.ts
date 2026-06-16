import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';

@Injectable()
export class SearchService {
  constructor(private db: DatabaseService) {}

  async search(tenantId: string, query: string, filters?: any) {
    // Basic text search implementation
    const [notes, documents, ideas] = await Promise.all([
      this.db.mysql.workspaceNote.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
      }),
      this.db.mysql.workspaceDocument.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
      }),
      this.db.mysql.workspaceIdea.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
      }),
    ]);

    return {
      notes,
      documents,
      ideas,
    };
  }
}
