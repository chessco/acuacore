import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CombinedAuthGuard } from '../../common/guards/combined-auth.guard';
import { getTenantId } from '../../common/tenant/tenant.middleware';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  async findAll() {
    const tenantId = getTenantId();
    return this.agentsService.findAll(tenantId);
  }

  @Post()
  async create(@Body() data: { name: string; slug: string; prompt: string }) {
    const tenantId = getTenantId();
    return this.agentsService.create({ ...data, tenantId });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const tenantId = getTenantId();
    return this.agentsService.findBySlug(slug, tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.agentsService.update(id, data);
  }

  @Post(':id/deploy')
  async deploy(@Param('id') id: string) {
    return this.agentsService.updateStatus(id, 'PRODUCTION');
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string) {
    return this.agentsService.findVersions(id);
  }

  @Post(':id/rollback/:versionId')
  async rollback(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.agentsService.rollback(id, versionId);
  }
}
