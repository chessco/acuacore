import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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
import { AuthModule } from './modules/auth/auth.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SkillsModule } from './modules/skills/skills.module';
import { AgentsModule } from './modules/agents/agents.module';
import { CapsulesModule } from './modules/capsules/capsules.module';
import { UsersModule } from './modules/users/users.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { CombinedAuthGuard } from './common/guards/combined-auth.guard';
import { MailModule } from './common/mail/mail.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/static',
    }),
    DatabaseModule,
    TenantsModule,
    WebhooksModule,
    ConversationsModule,
    HitlModule,
    AiModule,
    AuthModule,
    KnowledgeBaseModule,
    AnalyticsModule,
    SkillsModule,
    AgentsModule,
    CapsulesModule,
    UsersModule,
    MailModule,
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
      .forRoutes({ path: '(.*)', method: RequestMethod.ALL });
  }
}
