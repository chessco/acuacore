import { PrismaClient } from '@prisma/mysql-client';

const prisma = new PrismaClient();

async function main() {
  const skills = await prisma.skill.findMany();
  console.log(`Total skills: ${skills.length}`);
  skills.forEach(s => console.log(`- ${s.name} (${s.status})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
