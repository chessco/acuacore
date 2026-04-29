import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiRouterService } from './ai-router.service';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AiService, AiRouterService],
  exports: [AiService, AiRouterService],
})
export class AiModule {}
