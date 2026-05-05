import { Module } from '@nestjs/common';
import { CapsulesService } from './capsules.service';
import { CampaignService } from './campaign.service';
import { CapsulesController } from './capsules.controller';
import { CapsuleStudioController } from './capsule-studio.controller';
import { DatabaseModule } from '../../common/database/database.module';
import { AiModule } from '../ai/ai.module';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CombinedAuthGuard } from '../../common/guards/combined-auth.guard';
import { FeatureFlagGuard } from '../../common/guards/feature-flag.guard';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [CapsulesController, CapsuleStudioController],
  providers: [
    CapsulesService, 
    CampaignService,
    ApiKeyGuard,
    CombinedAuthGuard,
    FeatureFlagGuard
  ],
  exports: [CapsulesService],
})
export class CapsulesModule {}
