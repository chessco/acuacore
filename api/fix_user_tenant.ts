import { PrismaClient } from '@prisma/mysql-client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.update({
    where: { email: 'admin@pitayacode.io' },
    data: { 
      tenantId: 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718',
      role: 'ADMIN'
    }
  });
  console.log('Update result:', JSON.stringify(result, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
