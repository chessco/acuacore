import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/documents.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateDocumentDto) {
    const document = await this.prisma.workspaceDocument.create({
      data: {
        ...dto,
        tenantId,
        createdBy: userId,
      },
    });

    // TODO: Emit WorkspaceDocumentUploaded event
    // TODO: Trigger embeddings generation / text extraction

    return document;
  }

  async findAll(tenantId: string) {
    return this.prisma.workspaceDocument.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const document = await this.prisma.workspaceDocument.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async update(tenantId: string, id: string, dto: UpdateDocumentDto) {
    const document = await this.findOne(tenantId, id);
    const updated = await this.prisma.workspaceDocument.update({
      where: { id },
      data: dto,
    });

    return updated;
  }

  async remove(tenantId: string, id: string) {
    const document = await this.findOne(tenantId, id);
    return this.prisma.workspaceDocument.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
