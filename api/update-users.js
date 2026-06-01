const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: '@',
      }
    }
  });

  const targetEmails = ['soportecomercial', 'admin', 'almacen'];
  
  for (const user of users) {
    if (targetEmails.some(t => user.email.includes(t))) {
      let permissions = user.permissions;
      if (typeof permissions === 'string') {
        try { permissions = JSON.parse(permissions); } catch(e) {}
      }
      
      if (!permissions) permissions = { menus: [], actions: [] };
      if (!permissions.menus) permissions.menus = [];
      
      if (!permissions.menus.includes('donjuan')) {
        permissions.menus.push('donjuan');
        
        await prisma.user.update({
          where: { id: user.id },
          data: { permissions }
        });
        console.log(`Updated user: ${user.email}`);
      } else {
        console.log(`User ${user.email} already has donjuan access`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
