import { PrismaClient } from '@prisma/mysql-client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'mysql://root:acuacore_pass@localhost:3306/acuacore_db'
      }
    }
  });

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: '37fb8bb8-636b-4239-a634-80b8fede5c65' }
    });

    console.log('--- TENANT ENCONTRADO EN EL LOG ---');
    console.log(tenant ? `Nombre: ${tenant.name}` : 'No existe este ID en la base de datos');

    const users = await prisma.user.findMany({
      where: { tenantId: '37fb8bb8-636b-4239-a634-80b8fede5c65' }
    });
    console.log('\nUsuarios en este tenant:', users.map(u => u.email));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
