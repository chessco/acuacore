import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(tenantId: string, query: string, filters?: any) {
    // Basic text search implementation
    const [notes, documents, ideas] = await Promise.all([
      this.prisma.workspaceNote.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
      }),
      this.prisma.workspaceDocument.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
      }),
      this.prisma.workspaceIdea.findMany({
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
