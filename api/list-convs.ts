
import { PrismaClient } from '@prisma/mysql-client';
const prisma = new PrismaClient();

async function main() {
  const convs = await prisma.conversation.findMany({
    include: {
      messages: { take: 1 }
    }
  });
  console.log(JSON.stringify(convs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
