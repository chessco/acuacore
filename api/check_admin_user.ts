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
    const user = await prisma.user.findUnique({
      where: { email: 'admin@pitayacode.io' }
    });

    if (user) {
      console.log('--- USUARIO ENCONTRADO ---');
      console.log(`Email: ${user.email}`);
      console.log(`Rol en DB: ${user.role}`);
      console.log(`Tenant ID: ${user.tenantId}`);
    } else {
      console.log('ERROR: El usuario admin@pitayacode.io no existe.');
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
