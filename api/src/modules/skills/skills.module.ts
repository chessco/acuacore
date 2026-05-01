import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { DatabaseModule } from '../../common/database/database.module';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [SkillsController],
  providers: [SkillsService, ApiKeyGuard],
  exports: [SkillsService],
})
export class SkillsModule {}
