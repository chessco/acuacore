import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient as MySqlClient } from '@prisma/mysql-client';
import { PrismaClient as PostgresClient } from '@prisma/postgres-client';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public mysql: MySqlClient;
  public postgres: PostgresClient;

  constructor() {
    this.mysql = new MySqlClient();
    this.postgres = new PostgresClient();
  }

  async onModuleInit() {
    await this.mysql.$connect();
    await this.postgres.$connect();
  }

  async onModuleDestroy() {
    await this.mysql.$disconnect();
    await this.postgres.$disconnect();
  }

  async logAction(data: {
    tenantId?: string;
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    changes?: any;
  }) {
    return this.mysql.auditLog.create({
      data: {
        ...data,
        changes: data.changes || undefined,
      },
    });
  }
}
