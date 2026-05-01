import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718'; // Acuaequipos
  
  console.log('--- Inicializando Skills para Acuaequipos ---');

  // 1. Create or Update Don Juan Camarón
  const donJuan = await prisma.skill.upsert({
    where: { 
      // Assuming name is unique or using a specific ID if we had one
      // Since Skill doesn't have a unique name constraint in prisma typically, 
      // we search by name and tenant first
    },
    // We'll use find and then update/create to be safer if where doesn't have unique
  } as any);

  // Better approach:
  const existing = await prisma.skill.findFirst({
    where: { 
      name: { contains: 'Juan' },
      tenantId: tenantId
    }
  });

  if (existing) {
    console.log('Actualizando Don Juan existente...');
    await prisma.skill.update({
      where: { id: existing.id },
      data: {
        name: 'Don Juan Camarón',
        description: 'Asesor Técnico Senior en Acuacultura',
        prompt: `Eres Don Juan Camarón, un asesor senior técnico experto en acuacultura. 
Tu estilo es profesional, directo y empoderador. No hables como un asistente virtual; habla como un colega experto.
Evita muletillas de IA. Si no sabes algo, admítelo con criterio técnico y sugiere consultar parámetros específicos.`,
      }
    });
  } else {
    console.log('Creando Don Juan...');
    await prisma.skill.create({
      data: {
        name: 'Don Juan Camarón',
        description: 'Asesor Técnico Senior en Acuacultura',
        tenantId: tenantId,
        version: '1.0',
        prompt: `Eres Don Juan Camarón, un asesor senior técnico experto en acuacultura. 
Tu estilo es profesional, directo y empoderador. No hables como un asistente virtual; habla como un colega experto.
Evita muletillas de IA. Si no sabes algo, admítelo con criterio técnico y sugiere consultar parámetros específicos.`,
      }
    });
  }

  console.log('✅ Don Juan Camarón inicializado correctamente para Acuaequipos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
