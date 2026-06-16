const { PrismaClient } = require('./node_modules/@prisma/mysql-client');
const prisma = new PrismaClient();
prisma.agent.findMany()
  .then(agents => console.log('AGENTS:', JSON.stringify(agents, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
