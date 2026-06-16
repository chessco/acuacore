import { Module } from '@nestjs/common';
import { NotesController } from './notes/notes.controller';
import { NotesService } from './notes/notes.service';
import { DocumentsController } from './documents/documents.controller';
import { DocumentsService } from './documents/documents.service';
import { IdeasController } from './ideas/ideas.controller';
import { IdeasService } from './ideas/ideas.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AIController } from './ai/ai.controller';
import { AIService } from './ai/ai.service';
import { SearchController } from './search/search.controller';
import { SearchService } from './search/search.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    NotesController,
    DocumentsController,
    IdeasController,
    AIController,
    SearchController
  ],
  providers: [
    NotesService,
    DocumentsService,
    IdeasService,
    AIService,
    SearchService
  ],
  exports: [NotesService, DocumentsService, IdeasService]
})
export class WorkspaceModule {}
