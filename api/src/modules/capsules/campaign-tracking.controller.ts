import { Controller, Get, Param, Query, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { CampaignService } from './campaign.service';
import { Public } from '../../common/guards/public.decorator';

@Controller('campaign-tracking')
export class CampaignTrackingController {
  constructor(private readonly campaignService: CampaignService) {}

  @Public()
  @Get('open/:id')
  async trackOpen(
    @Param('id') id: string,
    @Query('e') email: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Record the open event
    await this.campaignService.recordEvent(id, 'OPEN', email, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Return a 1x1 transparent PNG pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    );
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(pixel);
  }

  @Public()
  @Get('click/:id')
  async trackClick(
    @Param('id') id: string,
    @Query('e') email: string,
    @Query('redirect') redirect: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Record the click event
    await this.campaignService.recordEvent(id, 'CLICK', email, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Redirect to the final destination
    if (redirect) {
      return res.redirect(redirect);
    }
    
    // Fallback if no redirect is provided
    return res.redirect('/');
  }
}
