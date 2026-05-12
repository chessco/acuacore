import { PrismaClient } from '@prisma/mysql-client';

async function main() {
  const prisma = new PrismaClient();

  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        name: { contains: 'Acuaequipos' }
      }
    });

    console.log('--- TENANTS ENCONTRADOS ---');
    for (const t of tenants) {
      const capsCount = await prisma.capsule.count({
        where: { tenantId: t.id }
      });
      console.log(`${t.name} (ID: ${t.id}) - Cápsulas: ${capsCount}`);
    }

    const allCaps = await prisma.capsule.groupBy({
      by: ['tenantId'],
      _count: { _all: true }
    });

    console.log('\n--- RESUMEN DE CÁPSULAS POR TENANT ID ---');
    for (const item of allCaps) {
        const t = await prisma.tenant.findUnique({ where: { id: item.tenantId || '' } });
        console.log(`Tenant: ${t ? t.name : 'NULL'} (ID: ${item.tenantId}) - Count: ${item._count._all}`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
