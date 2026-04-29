import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
