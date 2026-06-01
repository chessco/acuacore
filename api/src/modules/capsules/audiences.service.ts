import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class AudiencesService {
  constructor(private db: DatabaseService) {}

  async createAudience(tenantId: string, data: { name: string; description?: string }) {
    return this.db.mysql.audience.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async getAudiences(tenantId: string) {
    return this.db.mysql.audience.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAudience(tenantId: string, id: string) {
    const audience = await this.db.mysql.audience.findFirst({
      where: { id, tenantId },
    });
    if (!audience) throw new NotFoundException('Audience not found');
    return audience;
  }

  async deleteAudience(tenantId: string, id: string) {
    const audience = await this.getAudience(tenantId, id);
    return this.db.mysql.audience.delete({
      where: { id: audience.id },
    });
  }

  async getMembers(tenantId: string, audienceId: string) {
    await this.getAudience(tenantId, audienceId);
    return this.db.mysql.audienceMember.findMany({
      where: { audienceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addMember(tenantId: string, audienceId: string, data: any) {
    await this.getAudience(tenantId, audienceId);
    
    // Check if exists
    const existing = await this.db.mysql.audienceMember.findUnique({
      where: { audienceId_email: { audienceId, email: data.email } }
    });

    if (existing) {
      return this.db.mysql.audienceMember.update({
        where: { id: existing.id },
        data
      });
    }

    return this.db.mysql.audienceMember.create({
      data: {
        ...data,
        audienceId,
      },
    });
  }

  async importMembersFromTsv(tenantId: string, audienceId: string, tsvData: string) {
    await this.getAudience(tenantId, audienceId);

    const rows = tsvData.split('\n').filter(r => r.trim());
    if (rows.length === 0) return { success: false, message: 'No data' };

    // Asume the first row is headers if it doesn't contain an email pattern
    let headers = rows[0].split('\t').map(h => h.trim().toLowerCase());
    let dataRows = rows;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const firstRowHasEmail = headers.some(h => emailRegex.test(h));

    if (firstRowHasEmail) {
      // No headers found, use generic ones
      headers = headers.map((_, i) => `col_${i}`);
    } else {
      // Has headers, so skip first row
      dataRows = rows.slice(1);
    }

    let importedCount = 0;
    const errors = [];

    for (const row of dataRows) {
      const cols = row.split('\t').map(c => c.trim());
      
      // Find email column
      let emailIdx = headers.findIndex(h => h.includes('email') || h.includes('correo'));
      if (emailIdx === -1) {
         // Find first column that looks like an email
         emailIdx = cols.findIndex(c => emailRegex.test(c));
      }

      if (emailIdx === -1 || !cols[emailIdx] || !emailRegex.test(cols[emailIdx])) {
        errors.push(`Row ignored: No valid email found (${row.substring(0, 30)}...)`);
        continue;
      }

      const email = cols[emailIdx].toLowerCase();
      
      // Try to find name and phone
      let nameIdx = headers.findIndex(h => h.includes('nombre') || h.includes('contacto') || h.includes('name'));
      let phoneIdx = headers.findIndex(h => h.includes('tel') || h.includes('phone'));
      
      const firstName = nameIdx !== -1 ? cols[nameIdx] : null;
      const phone = phoneIdx !== -1 ? cols[phoneIdx] : null;

      // Extract metadata (everything else)
      const metadata: any = {};
      headers.forEach((h, idx) => {
        if (idx !== emailIdx && idx !== nameIdx && idx !== phoneIdx && cols[idx]) {
          metadata[h] = cols[idx];
        }
      });

      try {
        await this.db.mysql.audienceMember.upsert({
          where: { audienceId_email: { audienceId, email } },
          create: {
            audienceId,
            email,
            firstName,
            phone,
            metadata: Object.keys(metadata).length > 0 ? metadata : null
          },
          update: {
            firstName: firstName || undefined,
            phone: phone || undefined,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined
          }
        });
        importedCount++;
      } catch (err) {
        errors.push(`Error saving ${email}`);
      }
    }

    return { success: true, importedCount, errors };
  }

  async removeMember(tenantId: string, audienceId: string, memberId: string) {
    await this.getAudience(tenantId, audienceId);
    return this.db.mysql.audienceMember.delete({
      where: { id: memberId, audienceId }
    });
  }
}
