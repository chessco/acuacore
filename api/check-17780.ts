
import { PrismaClient } from '@prisma/mysql-client';
const prisma = new PrismaClient();

async function main() {
  const conv = await prisma.conversation.findFirst({
    where: { 
      OR: [
        { id: { contains: '17780' } },
        { externalId: { contains: '17780' } },
        { metadata: { path: ['externalId'], equals: '17780' } }
      ]
    },
    include: {
      messages: true
    }
  });
  console.log(JSON.stringify(conv, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
