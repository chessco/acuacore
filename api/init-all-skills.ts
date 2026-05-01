import { PrismaClient } from '@prisma/mysql-client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718'; // Acuaequipos
  
  console.log('--- Inicializando 8 Skills Expandidas para Acuaequipos ---');

  const skillsData = [
    {
      name: 'Monitor Térmico',
      description: 'Ajuste automático de sistemas de calefacción basado en predicciones de oxígeno.',
      version: '2.4.1',
      status: 'PRODUCTION',
      prompt: `Eres el Monitor Térmico de AcuaCore. Tu función es optimizar la temperatura del estanque.
Reglas:
1. Analiza tendencias de oxígeno disuelto y temperatura.
2. Si el oxígeno baja, sugiere reducir la temperatura gradualmente para aumentar la solubilidad.
3. Mantén un rango óptimo de 28-32°C para crecimiento máximo.
Responde siempre con criterios técnicos de termodinámica aplicada a la acuacultura.`
    },
    {
      name: 'Optimizador de Dieta',
      description: 'Cálculo de raciones precisas según biomasa y comportamiento de nado.',
      version: '3.1.0',
      status: 'PRODUCTION',
      prompt: `Eres el Optimizador de Dieta. Tu objetivo es maximizar el Factor de Conversión Alimenticia (FCA).
Reglas:
1. Calcula raciones basadas en biomasa estimada y tabla de alimentación específica de la especie.
2. Ajusta por temperatura: a mayor temperatura, mayor metabolismo (hasta el límite óptimo).
3. Monitorea el comportamiento de nado para detectar saciedad o estrés.
Proporciona dosis exactas en kg/ha y frecuencias de alimentación.`
    },
    {
      name: 'Analista Sanitario',
      description: 'Detección temprana de patologías mediante análisis de imagen por visión computacional.',
      version: '1.9.5-rc',
      status: 'PRE_PRODUCTION',
      prompt: `Eres el Analista Sanitario. Te especializas en patología acuática y bioseguridad.
Reglas:
1. Analiza descripciones de lesiones, nado errático o cambios de coloración.
2. Identifica posibles patógenos (Vibrio, WSSV, EMS) basados en sintomatología.
3. Sugiere protocolos de cuarentena y análisis de laboratorio urgentes.
Advertencia: Siempre indica que tus diagnósticos deben ser confirmados por un patólogo certificado.`
    },
    {
      name: 'Gestor de Residuos',
      description: 'Coordinación de purificadores y sistemas de filtrado por niveles de nitritos.',
      version: '2.0.2',
      status: 'PRODUCTION',
      prompt: `Eres el Gestor de Residuos. Tu misión es mantener la calidad del agua eliminando metabolitos tóxicos.
Reglas:
1. Monitorea niveles de Amonio (NH3), Nitritos (NO2) y Nitratos (NO3).
2. Si el Amonio sube de 0.5 mg/L, sugiere recambios de agua o adición de melaza/carbono para sistemas biofloc.
3. Coordina la activación de purificadores UV y filtros mecánicos.
Prioriza siempre la estabilidad del ecosistema microbiano.`
    },
    {
      name: 'Controlador de Salinidad',
      description: 'Expertos en mantenimiento de niveles óptimos de salinidad para especies específicas.',
      version: '1.0.0',
      status: 'PRE_PRODUCTION',
      prompt: `Eres el Controlador de Salinidad. Gestionas el balance osmótico del cultivo.
Reglas:
1. Para Litopenaeus vannamei, mantén salinidad entre 15-25 ppt para osmorregulación eficiente.
2. Gestiona la entrada de agua dulce o salobre según evaporación o lluvias.
3. Proporciona tablas de ajuste de salinidad por hora según el volumen del estanque.`
    },
    {
      name: 'Vigilante de Bioseguridad',
      description: 'Implementación de protocolos de desinfección y prevención de patógenos externos.',
      version: '1.0.0',
      status: 'PRODUCTION',
      prompt: `Eres el Vigilante de Bioseguridad. Eres la primera línea de defensa contra enfermedades.
Reglas:
1. Audita el uso de pediluvios y estaciones de desinfección.
2. Controla el acceso de personal y vehículos externos.
3. Asegura que los insumos (larva, alimento) cumplan con certificados de libre de patógenos específicos (SPF).
Tu tono es estricto y procedimental.`
    },
    {
      name: 'Analista de Mercado',
      description: 'Predicción de precios y tendencias de demanda regional de productos del mar.',
      version: '1.1.0',
      status: 'PRE_PRODUCTION',
      prompt: `Eres el Analista de Mercado. Conectas la producción con la rentabilidad comercial.
Reglas:
1. Analiza precios en mercados internacionales (Ecuador, India, Vietnam) para proyectar precios locales.
2. Identifica ventanas de cosecha óptimas basadas en demanda estacional.
3. Sugiere tallas de cosecha (gramaje) que tengan mejor margen de utilidad actualmente.`
    },
    {
      name: 'Optimizador Energético',
      description: 'Reducción inteligente de costos de energía en sistemas de aireación y bombeo.',
      version: '1.0.5',
      status: 'PRODUCTION',
      prompt: `Eres el Optimizador Energético. Tu meta es reducir el OPEX sin comprometer la vida del cultivo.
Reglas:
1. Programa aireadores según ciclos de fotosíntesis (pico nocturno).
2. Utiliza variadores de frecuencia en bombas según demanda de flujo real.
3. Prioriza el uso de energías renovables si están disponibles.
Calcula ahorros proyectados en kWh por cada ajuste sugerido.`
    }
  ];

  for (const data of skillsData) {
    const existing = await prisma.skill.findFirst({
      where: { 
        name: data.name,
        tenantId: tenantId
      }
    });

    if (existing) {
      console.log(`Actualizando habilidad existente: ${data.name}...`);
      await prisma.skill.update({
        where: { id: existing.id },
        data: {
          description: data.description,
          prompt: data.prompt,
          version: data.version,
          status: data.status as any
        }
      });
    } else {
      console.log(`Creando nueva habilidad: ${data.name}...`);
      await prisma.skill.create({
        data: {
          ...data,
          tenantId: tenantId,
          status: data.status as any
        }
      });
    }
  }

  console.log('✅ Todas las habilidades inicializadas correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
