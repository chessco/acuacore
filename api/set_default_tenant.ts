import { PrismaClient } from '@prisma/mysql-client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'mysql://root:acuacore_pass@localhost:3314/acuacore_db'
      }
    }
  });

  try {
    await prisma.tenant.updateMany({
      data: { isDefault: false }
    });

    await prisma.tenant.update({
      where: { id: 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718' },
      data: { isDefault: true }
    });

    console.log('EXITO: ACUAEQUIPOS DE OBREGON es ahora el Tenant por defecto.');

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
