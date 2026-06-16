import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import { CreateIdeaDto, UpdateIdeaDto } from './dto/ideas.dto';

@Injectable()
export class IdeasService {
  constructor(private db: DatabaseService) {}

  async create(tenantId: string, userId: string, dto: CreateIdeaDto) {
    const idea = await this.db.mysql.workspaceIdea.create({
      data: {
        ...dto,
        tenantId,
        createdBy: userId,
      },
    });

    // TODO: Emit WorkspaceIdeaCreated event
    // TODO: Trigger embeddings generation

    return idea;
  }

  async findAll(tenantId: string) {
    return this.db.mysql.workspaceIdea.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const idea = await this.db.mysql.workspaceIdea.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!idea) throw new NotFoundException('Idea not found');
    return idea;
  }

  async update(tenantId: string, id: string, dto: UpdateIdeaDto) {
    const idea = await this.findOne(tenantId, id);
    const updated = await this.db.mysql.workspaceIdea.update({
      where: { id },
      data: dto,
    });

    // TODO: Emit WorkspaceIdeaUpdated event

    return updated;
  }

  async remove(tenantId: string, id: string) {
    const idea = await this.findOne(tenantId, id);
    return this.db.mysql.workspaceIdea.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
