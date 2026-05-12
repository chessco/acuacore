const { PrismaClient } = require('./node_modules/@prisma/mysql-client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO SCRIPT DE EMERGENCIA (PASSWORD RESET) ---');
  
  const email = 'system@pitayacode.io';
  const name = 'System Admin';
  const password = 'pitaya123';
  const role = 'SYSTEM';
  
  const tenantId = 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718'; 

  const hashedPassword = await bcrypt.hash(password, 10);

  // Limpiar primero para asegurar que no hay basura
  await prisma.user.deleteMany({ where: { email } });
  console.log('--- Usuario previo eliminado (si existía) ---');

  // Buscar el tenant por ID, por nombre o simplemente el primero disponible
  let tenant = await prisma.tenant.findFirst({
    where: { OR: [{ id: tenantId }, { name: { contains: 'Acua' } }] }
  });

  if (!tenant) tenant = await prisma.tenant.findFirst();
  
  if (!tenant) {
    console.log('⚠️ No hay tenants, creando uno de sistema...');
    tenant = await prisma.tenant.create({
      data: { id: 'sys-tenant', name: 'Sistema AcuaCore' }
    });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role,
      status: 'ACTIVE',
      tenantId: tenant.id
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role,
      tenantId: tenant.id,
      status: 'ACTIVE'
    }
  });

  console.log('✅ Usuario SYSTEM procesado con éxito.');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password} (Actualizado)`);
  console.log('--- Recuerda guardar estas credenciales en un lugar seguro ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
