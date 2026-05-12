const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@pitayacode.io' },
    include: { tenant: true }
  });
  console.log('USER_DATA_START');
  console.log(JSON.stringify(user, null, 2));
  console.log('USER_DATA_END');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
