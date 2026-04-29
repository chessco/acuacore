import { PrismaClient } from '@prisma/mysql-client';
const prisma = new PrismaClient();

async function main() {
  const tenantId = 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718';
  const userId = '526442221844';
  const content = 'Test message';

  console.log('--- Simulating handleIncomingMessage ---');
  
  // 1. Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { userId, tenantId },
  });

  if (!conversation) {
    console.log('Creating conversation...');
    conversation = await prisma.conversation.create({
      data: { userId, tenantId },
    });
  }

  // 2. Save user message
  console.log('Saving message...');
  const savedUserMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      tenantId,
      role: 'user',
      content,
    },
  });

  console.log('SUCCESS:', JSON.stringify(savedUserMessage, null, 2));
}

main().catch(e => {
  console.error('CRASH:', e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
