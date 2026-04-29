import { Module, forwardRef } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiRouterService } from './ai-router.service';
import { PredictiveService } from './predictive.service';
import { DatabaseModule } from '../../common/database/database.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

import { AiController } from './ai.controller';

@Module({
  imports: [DatabaseModule, forwardRef(() => KnowledgeBaseModule)],
  controllers: [AiController],
  providers: [AiService, AiRouterService, PredictiveService],
  exports: [AiService, AiRouterService, PredictiveService],
})
export class AiModule {}
