const { PrismaClient } = require('@prisma/mysql-client');
const prisma = new PrismaClient();

async function main() {
  const tenantId = 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718';
  const agentId = 'ec616ca3-0fee-4e05-8af5-1ac190d470bb';

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });

  if (!agent) {
    console.error('No agent found for tenant.');
    return;
  }

  const capsule = await prisma.capsule.upsert({
    where: { slug: 'optimizacion-fca' },
    update: {},
    create: {
      tenantId: tenant.id,
      agentId: agent.id,
      title: 'Optimiza el Factor de Conversión Alimenticia (FCA)',
      slug: 'optimizacion-fca',
      topic: 'Optimización de FCA en camarón',
      description: 'Esta cápsula utiliza IA para calcular raciones exactas basadas en temperatura, oxígeno y comportamiento de nado, reduciendo el desperdicio hasta en un 12%.',
      status: 'PUBLISHED',
      contentBlocks: [
        {
          title: 'Raciones precisas',
          content: 'Modelos predictivos que ajustan la cantidad de alimento según la biomasa estimada y la etapa de crecimiento.'
        },
        {
          title: 'Ajuste por temperatura',
          content: 'El metabolismo del camarón varía con el clima. Nuestra IA recalcula la tasa de alimentación cada hora.'
        },
        {
          title: 'Monitoreo de saciedad',
          content: 'Análisis visual y acústico (si hay sensores) para detectar cuando el camarón deja de comer.'
        }
      ],
      promptConfig: {
        extraInstructions: 'Enfócate mucho en la importancia de la aireación durante los picos de alimentación.'
      },
      ctaConfig: {
        buttonText: 'Solicitar Asesoría Técnica'
      }
    }
  });

  console.log('Capsule created/updated:', capsule.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
