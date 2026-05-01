const { PrismaClient } = require('@prisma/mysql-client');
const prisma = new PrismaClient();

async function main() {
  const tenantId = 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718'; // Acuaequipos
  
  console.log('--- Forzando Don Juan a PRODUCTION ---');

  const existing = await prisma.skill.findFirst({
    where: { 
      name: { contains: 'Juan' },
      tenantId: tenantId
    }
  });

  if (existing) {
    console.log('Skill encontrada. Actualizando status via raw query para asegurar bypass de tipos...');
    // We use queryRaw because the client might not have 'status' yet
    await prisma.$executeRaw`UPDATE Skill SET status = 'PRODUCTION' WHERE id = ${existing.id}`;
    console.log('✅ Status actualizado a PRODUCTION.');
  } else {
    console.log('❌ No se encontró la skill.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
