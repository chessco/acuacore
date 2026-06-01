import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { AudiencesService } from './audiences.service';
import { CombinedAuthGuard } from '../../common/guards/combined-auth.guard';

@Controller('capsule-studio/audiences')
@UseGuards(CombinedAuthGuard)
export class AudiencesController {
  constructor(private readonly audiencesService: AudiencesService) {}

  @Post()
  async createAudience(@Request() req: any, @Body() data: { name: string; description?: string }) {
    return this.audiencesService.createAudience(req.user.tenantId, data);
  }

  @Get()
  async getAudiences(@Request() req: any) {
    return this.audiencesService.getAudiences(req.user.tenantId);
  }

  @Get(':id')
  async getAudience(@Request() req: any, @Param('id') id: string) {
    return this.audiencesService.getAudience(req.user.tenantId, id);
  }

  @Delete(':id')
  async deleteAudience(@Request() req: any, @Param('id') id: string) {
    return this.audiencesService.deleteAudience(req.user.tenantId, id);
  }

  @Get(':id/members')
  async getMembers(@Request() req: any, @Param('id') id: string) {
    return this.audiencesService.getMembers(req.user.tenantId, id);
  }

  @Post(':id/members')
  async addMember(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.audiencesService.addMember(req.user.tenantId, id, data);
  }

  @Post(':id/members/import')
  async importMembers(@Request() req: any, @Param('id') id: string, @Body('data') tsvData: string) {
    return this.audiencesService.importMembersFromTsv(req.user.tenantId, id, tsvData);
  }

  @Delete(':id/members/:memberId')
  async removeMember(@Request() req: any, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.audiencesService.removeMember(req.user.tenantId, id, memberId);
  }
}
