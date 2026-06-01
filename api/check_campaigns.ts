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
    const campaigns = await prisma.campaign.findMany({
      where: {
        tenantId: 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718'
      }
    });

    console.log(`--- CAMPAÑAS EN OBREGON ---`);
    console.log(`Total: ${campaigns.length}`);
    for (const c of campaigns) {
        console.log(`- ${c.name} (ID: ${c.id})`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
