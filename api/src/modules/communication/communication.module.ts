import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';

import { FilesystemSessionStorageProvider } from './providers/session-storage/filesystem-session-storage.provider';
import { WhatsappWebProvider } from './providers/whatsapp-web/whatsapp-web.provider';
import { CommunicationEventBusService } from './events/communication-event-bus.service';
import { SessionService } from './sessions/session.service';
import { SessionController } from './sessions/session.controller';
import { WhatsAppController } from './whatsapp.controller';
import { CommunicationGateway } from './gateways/communication.gateway';
import { ChannelsModule } from './channels/channels.module';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
    DatabaseModule,
    ChannelsModule,
  ],
  providers: [
    FilesystemSessionStorageProvider,
    CommunicationEventBusService,
    WhatsappWebProvider,
    SessionService,
    CommunicationGateway,
  ],
  controllers: [SessionController, WhatsAppController],
  exports: [
    WhatsappWebProvider,
    CommunicationEventBusService,
    SessionService,
    ChannelsModule,
  ],
})
export class CommunicationModule {}
