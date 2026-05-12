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
    const capsule = await prisma.capsule.findUnique({
      where: { id: '8f3ed987-7f7a-4ff8-8530-16c5f2d0f056' }
    });

    if (capsule) {
      console.log('--- CÁPSULA ENCONTRADA ---');
      console.log(`Título: ${capsule.title}`);
      console.log(`Tenant ID: ${capsule.tenantId}`);
    } else {
      console.log('ERROR: La cápsula con ID 8f3ed987-7f7a-4ff8-8530-16c5f2d0f056 NO EXISTE en la base de datos.');
      
      const allCapsules = await prisma.capsule.findMany({ take: 5 });
      console.log('\nCápsulas que sí existen:');
      allCapsules.forEach(c => console.log(`- ${c.title} (ID: ${c.id})`));
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
