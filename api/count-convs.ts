
import { PrismaClient } from '@prisma/mysql-client';
const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.conversation.groupBy({
    by: ['tenantId'],
    _count: {
      id: true
    }
  });
  console.log(JSON.stringify(counts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
