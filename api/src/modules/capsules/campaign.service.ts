import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class CampaignService {
  constructor(
    private db: DatabaseService,
    private mailService: MailService,
  ) {}

  async createCampaign(tenantId: string, data: any) {
    return this.db.mysql.campaign.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async getCampaigns(tenantId: string) {
    return this.db.mysql.campaign.findMany({
      where: { tenantId },
      include: { capsule: true },
    });
  }

  async getCampaign(tenantId: string, id: string) {
    return this.db.mysql.campaign.findFirst({
      where: { id, tenantId },
      include: { capsule: true },
    });
  }

  async sendCampaign(tenantId: string, id: string) {
    const campaign = await this.getCampaign(tenantId, id);
    if (!campaign) throw new Error('Campaign not found');

    // Send emails to the audience
    if (campaign.audience) {
      const emails = campaign.audience.split(/[,|\n]/).filter((e: string) => e.trim());
      for (const email of emails) {
        await this.mailService.sendMail(
          email.trim(),
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
                        <td align="center" style="background: linear-gradient(135deg, #001A41 0%, #0044CC 100%); padding: 60px 40px;">
                            <img src="https://acuacore.io/logo-white.png" alt="AcuaCore" width="120" style="margin-bottom: 24px; display: block;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.2;">
                                ${campaign.name}
                            </h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <div style="background-color: #f1f5f9; width: 40px; height: 4px; border-radius: 2px; margin-bottom: 32px;"></div>
                            
                            <p style="color: #334155; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 500;">
                                Hola,
                            </p>
                            
                            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 40px 0;">
                                ${campaign.content}
                            </p>

                            <!-- CTA Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="https://acuacore.io/capsule/${campaign.capsuleId}" 
                                           style="background-color: #2563eb; color: #ffffff; padding: 20px 40px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);">
                                            Explorar Cápsula Interactiva
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
                                            © 2026 AcuaCore Studio. Todos los derechos reservados.
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
}
