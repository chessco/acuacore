import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeIngestionService } from './knowledge-ingestion.service';
import { DatabaseModule } from '../../common/database/database.module';
import { AiModule } from '../ai/ai.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, forwardRef(() => AiModule)],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService, KnowledgeIngestionService],
  exports: [KnowledgeBaseService, KnowledgeIngestionService],
})
export class KnowledgeBaseModule {}
