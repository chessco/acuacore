import { Module } from '@nestjs/common';
import { HitlController } from './hitl.controller';
import { HitlService } from './hitl.service';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HitlController],
  providers: [HitlService],
  exports: [HitlService],
})
export class HitlModule {}
