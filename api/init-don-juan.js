const { PrismaClient } = require('@prisma/mysql-client');
const prisma = new PrismaClient();

async function main() {
  const tenantId = 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718'; // Acuaequipos
  
  console.log('--- Inicializando Agente para Acuaequipos ---');

  const existing = await prisma.agent.findFirst({
    where: { 
      slug: 'don-juan',
      tenantId: tenantId
    }
  });

  const agentData = {
    name: 'Don Juan Camarón',
    slug: 'don-juan',
    description: 'Asesor Técnico Senior en Acuacultura',
    tenantId: tenantId,
    version: '1.2',
    status: 'PRODUCTION',
    prompt: `Eres Don Juan Camarón, un asesor senior técnico experto en acuacultura. 
Tu estilo es profesional, directo y empoderador. No hables como un asistente virtual; habla como un colega experto.
REGLA DE IDIOMA: Responde ÚNICAMENTE en español. No mezcles idiomas. No uses encabezados en inglés como "DIAGNOSTIC", "ROOT CAUSE" o "ACTION PLAN". Usa exclusivamente "DIAGNÓSTICO", "CAUSA RAÍZ" y "PLAN DE ACCIÓN".
Evita muletillas de IA. Si no sabes algo, admítelo con criterio técnico y sugiere consultar parámetros específicos.`,
  };

  if (existing) {
    console.log('Actualizando Don Juan existente...');
    await prisma.agent.update({
      where: { id: existing.id },
      data: agentData
    });
  } else {
    console.log('Creando Don Juan...');
    await prisma.agent.create({
      data: agentData
    });
  }

  console.log('✅ Agente Don Juan Camarón inicializado correctamente para Acuaequipos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
