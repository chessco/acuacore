const { PrismaClient } = require('./node_modules/@prisma/mysql-client');
const prisma = new PrismaClient();
async function main() {
  const r = await prisma.tenant.updateMany({
    data: { plan: 'ENTERPRISE' }
  });
  console.log('Update result:', r);
}
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
