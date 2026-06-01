import { PrismaClient } from '@prisma/mysql-client';

async function main() {
  // Usamos la URL que el servidor tiene configurada
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'mysql://root:acuacore_pass@localhost:3306/acuacore_db'
      }
    }
  });

  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        name: { contains: 'Acuaequipos' }
      }
    });

    console.log('--- TENANTS EN LA DB REAL (3306) ---');
    if (tenants.length === 0) {
        console.log('No se encontraron tenants con "Acuaequipos"');
    }
    for (const t of tenants) {
      const capsCount = await prisma.capsule.count({
        where: { tenantId: t.id }
      });
      console.log(`${t.name} (ID: ${t.id}) - Cápsulas: ${capsCount}`);
    }

    const allCaps = await prisma.capsule.count();
    console.log('\nTotal de cápsulas en esta DB:', allCaps);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
