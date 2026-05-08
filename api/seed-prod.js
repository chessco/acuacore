const { PrismaClient } = require('@prisma/mysql-client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Actualizando Contraseña a Texto Plano ---');

  const user = await prisma.user.update({
    where: { email: 'admin@pitayacode.io' },
    data: {
      password: 'pitaya123',
    },
  });
  
  console.log('✅ Contraseña actualizada correctamente (texto plano) para:', user.email);
  console.log('--- Proceso Finalizado ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
