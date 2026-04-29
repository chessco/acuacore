import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { TenantMiddleware } from './common/tenant/tenant.middleware';
import { TenantsModule } from './modules/tenants/tenants.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { HitlModule } from './modules/hitl/hitl.module';
import { AiModule } from './modules/ai/ai.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { CombinedAuthGuard } from './common/guards/combined-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TenantsModule,
    WebhooksModule,
    ConversationsModule,
    HitlModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ApiKeyGuard,
    {
      provide: APP_GUARD,
      useClass: CombinedAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '(.*)', method: -1 }); // Fix for NestJS 11+ wildcards
  }
}
