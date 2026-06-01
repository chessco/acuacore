import { Module, forwardRef } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { DatabaseModule } from '../../common/database/database.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => ConversationsModule)],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
