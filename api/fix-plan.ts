import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const r = await prisma.tenant.updateMany({
    where: { name: { contains: 'OBREGON' } },
    data: { plan: 'ENTERPRISE' }
  });
  console.log('Update result:', r);
  const tenants = await prisma.tenant.findMany({
    select: { name: true, plan: true }
  });
  console.log('Current tenants:', JSON.stringify(tenants, null, 2));
}
main().finally(() => prisma.$disconnect());
