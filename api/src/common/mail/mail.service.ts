import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: any;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const provider = this.configService.get<string>('MAIL_PROVIDER') || 'gmail';
    
    if (provider === 'resend') {
      const apiKey = this.configService.get<string>('RESEND_API_KEY');
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: apiKey,
        },
      });
    } else {
      // Default to Gmail
      const host = this.configService.get<string>('SMTP_HOST');
      const port = this.configService.get<number>('SMTP_PORT');
      const user = this.configService.get<string>('SMTP_USER');
      const pass = this.configService.get<string>('SMTP_PASS');

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
  }

  async sendMail(to: string, subject: string, content: string) {
    try {
      const provider = this.configService.get<string>('MAIL_PROVIDER');
      const fromEmail = provider === 'resend' 
        ? 'onboarding@resend.dev' // Default Resend test email, should be changed to a verified domain in prod
        : this.configService.get('SMTP_USER');

      const info = await this.transporter.sendMail({
        from: `"AcuaCore Studio" <${fromEmail}>`,
        to,
        subject,
        html: content,
      });

      console.log(`Message sent via ${provider}: %s`, info.messageId);
      return info;
    } catch (error) {
      console.error(`Error sending email via ${this.configService.get('MAIL_PROVIDER')}:`, error);
      // Fallback logic could be added here
      throw error;
    }
  }
}
