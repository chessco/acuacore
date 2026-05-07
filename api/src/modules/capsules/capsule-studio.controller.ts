import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CapsulesService } from './capsules.service';
import { CampaignService } from './campaign.service';
import { CombinedAuthGuard } from '../../common/guards/combined-auth.guard';
import { FeatureFlagGuard } from '../../common/guards/feature-flag.guard';
import { RequireFeature } from '../../common/decorators/require-feature.decorator';

@Controller('capsule-studio')
@UseGuards(CombinedAuthGuard, FeatureFlagGuard)
@RequireFeature('capsules')
export class CapsuleStudioController {
  constructor(
    private readonly capsulesService: CapsulesService,
    private readonly campaignService: CampaignService,
  ) {}

  @Get('capsules')
  findAll(@Request() req: any) {
    return this.capsulesService.findAll(req.user.tenantId);
  }

  @Post('capsules')
  create(@Request() req: any, @Body() body: any) {
    return this.capsulesService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get('capsules/:id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.capsulesService.findOne(id, req.user.tenantId);
  }

  @Patch('capsules/:id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.capsulesService.update(id, req.user.tenantId, body);
  }

  @Patch('capsules/:id/status')
  updateStatus(@Request() req: any, @Param('id') id: string, @Body() body: { status: string }) {
    return this.capsulesService.updateStatus(id, req.user.tenantId, body.status);
  }

  @Delete('capsules/:id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.capsulesService.remove(id, req.user.tenantId);
  }

  @Get('campaigns')
  getCampaigns(@Request() req: any) {
    return this.campaignService.getCampaigns(req.user.tenantId);
  }

  @Post('campaigns')
  createCampaign(@Request() req: any, @Body() body: any) {
    return this.campaignService.createCampaign(req.user.tenantId, body);
  }

  @Post('campaigns/:id/send')
  sendCampaign(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.sendCampaign(req.user.tenantId, id);
  }

  @Get('analytics')
  getAnalytics(@Request() req: any) {
    return this.capsulesService.getAnalytics(req.user.tenantId);
  }
 
  @Get('branding')
  getBranding(@Request() req: any) {
    return this.capsulesService.getBranding(req.user.tenantId);
  }
 
  @Post('branding')
  updateBranding(@Request() req: any, @Body() body: any) {
    return this.capsulesService.updateBranding(req.user.tenantId, body);
  }
}
