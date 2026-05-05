const { PrismaClient } = require('@prisma/mysql-client');
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({ include: { agents: true } });
  console.log(JSON.stringify(tenants, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
