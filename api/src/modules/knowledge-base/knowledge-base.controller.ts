import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { getTenantId } from '../../common/tenant/tenant.middleware';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private db: DatabaseService) {}

  @Get()
  async list() {
    const tenantId = getTenantId();
    return this.db.mysql.knowledgeBase.findMany({
      where: {
        OR: [
          { tenantId },
          { tenantId: null }
        ]
      },
      include: {
        _count: {
          select: { chunks: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const tenantId = getTenantId();
    return this.db.mysql.knowledgeBase.findFirst({
      where: {
        id,
        OR: [
          { tenantId },
          { tenantId: null }
        ]
      },
      include: {
        chunks: {
          orderBy: { sequence: 'asc' }
        }
      }
    });
  }
}
