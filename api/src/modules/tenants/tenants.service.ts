import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class TenantsService {
  constructor(private db: DatabaseService) {}

  async create(data: { name: string; plan?: 'FREE' | 'PRO' | 'ENTERPRISE' }) {
    return this.db.mysql.tenant.create({
      data: {
        name: data.name,
        plan: data.plan || 'FREE',
      },
    });
  }

  async findAll() {
    return this.db.mysql.tenant.findMany();
  }

  async findOne(id: string) {
    return this.db.mysql.tenant.findUnique({
      where: { id },
    });
  }
}
