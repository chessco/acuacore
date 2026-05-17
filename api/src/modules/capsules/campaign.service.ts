import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { MailService } from '../../common/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { marked } from 'marked';

@Injectable()
export class CampaignService {
  constructor(
    private db: DatabaseService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async createCampaign(tenantId: string, data: any) {
    return this.db.mysql.campaign.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async updateCampaign(tenantId: string, id: string, data: any, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    const where = (isSystem || isGlobal) ? { id } : { id, tenantId };

    const campaign = await this.db.mysql.campaign.findFirst({ where });
    if (!campaign) throw new NotFoundException('Campaña no encontrada');

    return this.db.mysql.campaign.update({
      where: { id },
      data,
    });
  }

  async getCampaigns(tenantId: string, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    const where = (isSystem || isGlobal) ? {} : { tenantId };

    return this.db.mysql.campaign.findMany({
      where,
      include: { capsule: true },
    });
  }

  async getCampaign(tenantId: string, id: string, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    const where = (isSystem || isGlobal) ? { id } : { id, tenantId };

    return this.db.mysql.campaign.findFirst({
      where,
      include: { capsule: true },
    });
  }

  async sendCampaign(tenantId: string, id: string, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    const where = (isSystem || isGlobal) ? { id } : { id, tenantId };

    const campaign = await this.db.mysql.campaign.findFirst({
      where,
      include: { 
        capsule: true,
        tenant: true 
      },
    });
    if (!campaign) throw new Error('Campaign not found');

    const tenantBranding = (campaign.tenant?.brandingConfig as any) || {};
    const campaignConfig = (campaign.templateConfig as any) || {};
    
    // Merge: campaign config overrides tenant branding
    const config = { ...tenantBranding, ...campaignConfig };
    
    const primaryColor = config.primaryColor || '#001A41';
    const accentColor = config.accentColor || '#2563eb';
    const logoUrl = config.logoUrl || 'https://acuacore.io/logo-white.png';
    const ctaText = config.ctaText || 'Explorar Cápsula Interactiva';
    const footerText = config.footerText || '© 2026 Acuaequipos Capsulas Acuicolas. Todos los derechos reservados.';
    
    // Extract hero image: priority 1: branding config, priority 2: capsule hero block, priority 3: null
    const capsuleBlocks = (campaign.capsule?.contentBlocks as any[]) || [];
    const heroBlock = capsuleBlocks.find(b => b.type === 'hero');
    const capsuleHeroImage = heroBlock?.data?.image || heroBlock?.data?.imageUrl;
    const heroImage = config.heroImage || capsuleHeroImage || null;

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const apiUrl = this.configService.get('API_URL') || 'http://localhost:3014';

    // Helper to ensure absolute URLs
    const makeAbsolute = (url: string) => {
      if (!url) return url;
      if (url.startsWith('http')) return url;
      return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const finalLogoUrl = makeAbsolute(logoUrl);
    const finalHeroImage = makeAbsolute(heroImage);

    console.log(`[CampaignService] Sending email. Logo: ${finalLogoUrl}, Hero: ${finalHeroImage}`);

    // Parse Markdown content to HTML
    const formattedContent = marked.parse(campaign.content || '');

    // Tracking URLs
    const trackingPixelUrl = `${apiUrl}/api/campaign-tracking/open/${campaign.id}`;
    const trackingClickUrl = `${apiUrl}/api/campaign-tracking/click/${campaign.id}?redirect=`;

    // Send emails to the audience
    if (campaign.audience) {
      const emails = campaign.audience.split(/[,|\n]/).filter((e: string) => e.trim());
      console.log(`Sending campaign "${campaign.name}" to ${emails.length} recipients: ${emails.join(', ')}`);
      for (const email of emails) {
        const recipientEmail = email.trim();
        const trackingPixelWithEmail = `${trackingPixelUrl}?e=${encodeURIComponent(recipientEmail)}`;
        const finalCtaUrl = `${apiUrl}/api/campaign-tracking/click/${campaign.id}?e=${encodeURIComponent(recipientEmail)}&redirect=${encodeURIComponent(`${frontendUrl}/capsules/${campaign.capsule?.slug || ''}?campaignId=${campaign.id}`)}`;

        await this.mailService.sendMail(
          recipientEmail,
          campaign.subject,
          `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${campaign.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    <!-- Header with Gradient -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, ${primaryColor} 0%, #0044CC 100%); padding: 60px 40px;">
                            <img src="${finalLogoUrl}" alt="Logo" width="120" style="margin-bottom: 24px; display: block;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.2;">
                                ${campaign.name}
                            </h1>
                        </td>
                    </tr>

                    <!-- Optional Hero Image -->
                    ${finalHeroImage ? `
                    <tr>
                        <td style="padding: 0;">
                            <img src="${finalHeroImage}" alt="Hero" width="600" style="width: 100%; display: block; height: auto;">
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <div style="background-color: ${accentColor}; width: 40px; height: 4px; border-radius: 2px; margin-bottom: 32px;"></div>
                            
                            <p style="color: #334155; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 500;">
                                Hola Productor,
                            </p>
                            
                            <div style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 40px 0;">
                                ${formattedContent}
                            </div>
 
                            <!-- CTA Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="${finalCtaUrl}" 
                                           style="background-color: ${accentColor}; color: #ffffff; padding: 20px 40px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);">
                                            ${ctaText}
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 48px; font-style: italic;">
                                Haz clic en el botón superior para acceder a la experiencia completa.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 40px; border-top: 1px solid #f1f5f9; text-align: center;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <div style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                                            Conectando la Acuacultura
                                        </div>
                                        <div style="color: #94a3b8; font-size: 12px;">
                                            ${footerText}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <p style="color: #cbd5e1; font-size: 11px; max-width: 400px; margin: 0 auto; line-height: 1.5;">
                                            Recibiste este correo porque estás registrado en nuestra plataforma de distribución de cápsulas de conocimiento.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!-- Tracking Pixel -->
                <img src="${trackingPixelWithEmail}" width="1" height="1" style="display:none !important;" />
            </td>
        </tr>
    </table>
</body>
</html>
          `
        );
      }
    }

    return this.db.mysql.campaign.update({
      where: { id },
      data: {
        sentAt: new Date(),
      },
    });
  }

  async recordEvent(campaignId: string, type: 'OPEN' | 'CLICK', email: string, metadata?: any) {
    // 1. Create the event record
    const event = await this.db.mysql.campaignEvent.create({
      data: {
        campaignId,
        type,
        email,
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      },
    });

    // 2. Increment counters in the Campaign
    const updateData: any = {};
    if (type === 'OPEN') updateData.opensCount = { increment: 1 };
    if (type === 'CLICK') updateData.clicksCount = { increment: 1 };

    const campaign = await this.db.mysql.campaign.update({
      where: { id: campaignId },
      data: updateData,
    });

    // 2.5 Ensure a Lead record exists for this email
    if (email) {
      const existingLead = await this.db.mysql.lead.findFirst({
        where: { email, tenantId: campaign.tenantId }
      });

      // Parse user agent for telemetry
      const ua = metadata?.userAgent || '';
      const device = /mobile/i.test(ua) ? 'Móvil' : /tablet/i.test(ua) ? 'Tablet' : 'Desktop';
      const browser = /chrome|crios/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : /firefox/i.test(ua) ? 'Firefox' : 'Desconocido';
      const os = /iphone|ipad|ipod/i.test(ua) ? 'iOS' : /android/i.test(ua) ? 'Android' : /windows/i.test(ua) ? 'Windows' : /mac/i.test(ua) ? 'macOS' : 'Linux';

      // 2.6 SYNC WITH CRM CONTACTS
      const existingContact = await this.db.mysql.contact.findFirst({
        where: { email, tenantId: campaign.tenantId }
      });

      if (!existingContact) {
        const contact = await this.db.mysql.contact.create({
          data: {
            email,
            name: email.split('@')[0],
            status: 'LEAD',
            tenantId: campaign.tenantId,
            metadata: {
              source: 'EMAIL_CAMPAIGN',
              campaignName: campaign.name,
              firstInteraction: type
            }
          }
        });

        // AUTO-DEAL on CLICK for new contacts
        if (type === 'CLICK') {
          await this.db.mysql.deal.create({
            data: {
              title: `Oportunidad: ${campaign.name}`,
              value: 0,
              stage: 'NEW',
              status: 'OPEN',
              contactId: contact.id,
              tenantId: campaign.tenantId,
              metadata: { source: 'CAMPAIGN_AUTO_GEN', campaignId: campaign.id }
            } as any
          });
        }
      } else {
        // Log activity in existing contact
        await this.db.mysql.activity.create({
          data: {
            contactId: existingContact.id,
            tenantId: campaign.tenantId,
            type: 'CAMPAIGN',
            subject: `Interacción con Campaña: ${campaign.name}`,
            content: `El usuario realizó un ${type} desde un dispositivo ${device} (${os}).`,
          } as any
        });

        // AUTO-DEAL on CLICK for existing contacts (if no open deal for this campaign exists)
        if (type === 'CLICK') {
          const existingDeal = await this.db.mysql.deal.findFirst({
            where: { 
              contactId: existingContact.id, 
              status: 'OPEN',
              metadata: { path: '$.campaignId', equals: campaign.id } as any
            }
          });

          if (!existingDeal) {
            await this.db.mysql.deal.create({
              data: {
                title: `Oportunidad: ${campaign.name}`,
                value: 0,
                stage: 'NEW',
                status: 'OPEN',
                contactId: existingContact.id,
                tenantId: campaign.tenantId,
                metadata: { source: 'CAMPAIGN_AUTO_GEN', campaignId: campaign.id }
              } as any
            });
          }
        }
      }

      if (!existingLead) {
        console.log(`[CampaignService] Creating new lead with telemetry: ${email} (${device}/${os})`);
        await this.db.mysql.lead.create({
          data: {
            email,
            name: email.split('@')[0],
            campaignId,
            capsuleId: campaign.capsuleId,
            tenantId: campaign.tenantId,
            metadata: { 
              source: 'CAMPAIGN_EVENT', 
              lastEvent: type,
              device,
              browser,
              os,
              ip: metadata?.ip,
              userAgent: ua
            }
          }
        });
      } else {
        // Update telemetry on existing lead
        await this.db.mysql.lead.update({
          where: { id: existingLead.id },
          data: {
            metadata: {
              ...(existingLead.metadata as any),
              lastEvent: type,
              device,
              browser,
              os,
              updatedAt: new Date().toISOString()
            }
          }
        });
      }
    }

    // 3. Smart Follow-up Logic (Improvement #2)
    if (type === 'OPEN') {
      const openCount = await this.db.mysql.campaignEvent.count({
        where: { campaignId, email, type: 'OPEN' }
      });

      // If they open 3 times and haven't clicked yet, trigger AI Follow-up
      if (openCount === 3) {
        const hasClicked = await this.db.mysql.campaignEvent.findFirst({
          where: { campaignId, email, type: 'CLICK' }
        });

        if (!hasClicked) {
          console.log(`[AI Trigger] Lead ${email} is very interested (3 opens). Sending automated follow-up...`);
          await this.triggerAutoFollowUp(campaignId, email);
        }
      }
    }

    return event;
  }

  private async triggerAutoFollowUp(campaignId: string, email: string) {
    try {
      const campaign = await this.db.mysql.campaign.findUnique({
        where: { id: campaignId },
        include: { capsule: true }
      });

      if (!campaign) return;

      console.log(`[AI] Generating high-conversion follow-up for ${email} regarding ${campaign.name}`);
      
      // Record the system action in the event log
      await this.db.mysql.campaignEvent.create({
        data: {
          campaignId,
          type: 'FOLLOWUP_SENT',
          email,
          userAgent: 'AcuaCore AI Bot',
        },
      });

      // In a real scenario, this would call MailerService.send
      // ...
    } catch (err) {
      console.error('Error in auto follow-up:', err);
    }
  }

  async removeCampaign(tenantId: string, id: string, user?: any) {
    const isSystem = user?.role === 'SYSTEM' || user?.role === 'ADMIN';
    const isGlobal = tenantId === 'global' || tenantId === 'all';
    const where = (isSystem || isGlobal) ? { id } : { id, tenantId };
    
    const campaign = await this.db.mysql.campaign.findFirst({
      where,
    });

    if (!campaign) throw new NotFoundException('Campaña no encontrada');

    if (campaign.sentAt && user?.role !== 'SYSTEM') {
      throw new ConflictException('No se puede eliminar una campaña que ya ha sido enviada por correo.');
    }

    return this.db.mysql.campaign.delete({
      where: { id },
    });
  }
}
