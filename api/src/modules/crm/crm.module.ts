import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { WorkflowsService } from './workflows.service';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [CrmController],
  providers: [CrmService, WorkflowsService],
  exports: [CrmService, WorkflowsService],
})
export class CrmModule {}
