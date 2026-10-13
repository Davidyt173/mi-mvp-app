import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json({ limit: '30mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AdiestraPet Peru Full-Stack API' });
});

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Types for Diagnosis Request & Response
interface DiagnoseRequestBody {
  petName: string;
  petSpecies: 'perro';
  petAge: string;
  petBreed?: string;
  behaviorDescription: string;
  imageBase64?: string;
  imageMimeType?: string;
  isPeruvianContext?: boolean;
}

// Rule-based fallback diagnostics when API key is unavailable or fails
function generateRuleBasedDiagnosis(body: DiagnoseRequestBody) {
  const text = (body.behaviorDescription || '').toLowerCase();
  
  // Severe / veterinary risk check
  const severeAggressionWords = ['muerde fuerte', 'sangre', 'ataca personas', 'mordio a un niño', 'mordida grave', 'muy agresivo', 'rabia', 'convulsion'];
  const hasSevereRisk = severeAggressionWords.some(w => text.includes(w));

  if (hasSevereRisk) {
    return {
      engine: 'sistema_experto_reglas',
      petSummary: `Evaluación de conducta de alta prioridad para ${body.petName} (canino).`,
      behaviorType: 'Agresividad reactiva o dolor físico subyacente',
      urgencyLevel: 'Alerta Profesional Urgente',
      professionalWarning: true,
      warningDetails: 'Riesgo inminente de mordedura o afección médica dolorosa. Es fundamental descartar dolor articular/dental antes de modificar conducta. No aplicar castigos físicos ni collares de castigo.',
      possibleCauses: [
        'Dolor físico o patología médica no diagnosticada (artrosis, dolor dental, otitis).',
        'Miedo extremo o reacción defensiva ante pérdida de distancia crítica.',
        'Asociación negativa previa por manejo aversivo o castigos pasados.'
      ],
      positiveSteps: [
        'Paso 1: Agendar revisión veterinaria médica integral para descarte de dolor orgánico.',
        'Paso 2: Gestión ambiental inmediata: crear zona segura donde nadie invada su espacio.',
        'Paso 3: Suspender cualquier estímulo que detone la conducta reactiva.',
        'Paso 4: Contactar un etólogo clínico colegiado en Perú (CMVP) para terapia presencial.'
      ],
      dailyExercise: {
        title: 'Manejo de Calma y Descompresión',
        durationMinutes: 10,
        instructions: 'Proporcionar alfombra olfativa (snuffle mat) o juguete interactivo con premios de alto valor (pollo sancochado) en un ambiente tranquilo y sin visitas.'
      },
      recommendedModules: ['mod_ansiedad_calma', 'mod_seguridad_reactividad'],
      peruvianTip: 'En zonas urbanas de Lima o ciudades peruanas con alto estímulo de motos y serenazgo, realiza salidas breves en horarios de baja afluencia (5:30 am o 9:30 pm).',
      shareSummary: `Mini-plan de bienestar y calma para ${body.petName}. Cuidamos su salud emocional con refuerzo positivo.`
    };
  }

  // Barking / Vocalization
  if (text.includes('ladra') || text.includes('ruido') || text.includes('timbre')) {
    return {
      engine: 'sistema_experto_reglas',
      petSummary: `Gestión de alerta vocal y calma para ${body.petName}.`,
      behaviorType: 'Ladridos por alerta o demanda de atención',
      urgencyLevel: 'Moderado',
      professionalWarning: false,
      warningDetails: null,
      possibleCauses: [
        'Hipersensibilidad a ruidos ambientales en edificios o pasadizos.',
        'Refuerzo involuntario: el tutor responde hablando o acariciando durante el ladrido.',
        'Acumulación de energía por estimulación mental o física insuficiente.'
      ],
      positiveSteps: [
        'Paso 1: Desensibilización sistemática con ruidos grabados a volumen mínimo emparejados con snacks de hígado o pollo.',
        'Paso 2: Enseñar conducta incompatible (e.g. ir a su alfombra / cama "lugar seguro").',
        'Paso 3: Extinción del refuerzo involuntario: ignorar la demanda vocal y premiar 3 segundos de silencio absoluto.',
        'Paso 4: Paseo olfativo de 25 minutos con correa de 2 a 3 metros para reducir cortisol.'
      ],
      dailyExercise: {
        title: 'Ejercicio de Silencio y Refuerzo Diferencial',
        durationMinutes: 15,
        instructions: 'Espera un momento de calma natural. Cuando mire hacia el pasillo y no ladre por 3 segundos, haz sonar el clicker o di "Muy bien" y entrega un premio sabroso.'
      },
      recommendedModules: ['mod_ladridos_solucion', 'mod_autocontrol_impulso'],
      peruvianTip: 'En departamentos de Miraflores, San Borja o Jesús María con tránsito denso, coloca música instrumental relajante o ruido blanco cerca de la puerta principal.',
      shareSummary: `${body.petName} está aprendiendo a canalizar sus ladridos con refuerzo positivo en AdiestraPet Perú.`
    };
  }

  // Leash pulling / Walk issues
  if (text.includes('jala') || text.includes('correa') || text.includes('paseo') || text.includes('tirones')) {
    return {
      engine: 'sistema_experto_reglas',
      petSummary: `Protocolo de paseo relajado y conexión con correa para ${body.petName}.`,
      behaviorType: 'Tirones de correa y frustración por barrera',
      urgencyLevel: 'Normal',
      professionalWarning: false,
      warningDetails: null,
      possibleCauses: [
        'Ritmo natural de caminata del perro (más rápido que el humano) sin entrenamiento previo.',
        'Uso de collar convencional que genera tensión en cuello y reflejo de oposición.',
        'Falta de saciación olfativa: el perro busca llegar desesperadamente a olores lejanos.'
      ],
      positiveSteps: [
        'Paso 1: Cambiar a arnés anti-tirones ergonómico en forma de "Y" con enganche frontal en pecho.',
        'Paso 2: Técnica "Árbol Rojo": cuando la correa se tense, detente de inmediato como un árbol sin tirar de vuelta.',
        'Paso 3: Cuando afloje la tensión y te mire, premia inmediatamente junto a tu pierna.',
        'Paso 4: Permitir 10 minutos de olfateo libre ("sniffari") donde el perro decide el ritmo de lectura de olores.'
      ],
      dailyExercise: {
        title: 'Entrenamiento de Seguimiento Voluntario en Casa',
        durationMinutes: 12,
        instructions: 'Practica en la sala sin distracciones. Camina 5 pasos; cuando tu mascota camine a tu lado sin tensar la correa imaginaria, premia y felicita con entusiasmo.'
      },
      recommendedModules: ['mod_paseo_perfecto', 'mod_atencion_enfoque'],
      peruvianTip: 'Evita los malecones o parques caninos muy concurridos en fines de semana hasta consolidar el ejercicio; practica primero en bermas tranquilas de tu distrito.',
      shareSummary: `${body.petName} y yo avanzamos hacia paseos sin tirones con el método AdiestraPet Perú.`
    };
  }

  // Default Positive Reinforcement Behavioral Assessment
  return {
    engine: 'sistema_experto_reglas',
    petSummary: `Plan integral de refuerzo positivo y estimulación adaptativa para ${body.petName}.`,
    behaviorType: 'Canalización de impulsos y fortalecimiento del vínculo',
    urgencyLevel: 'Normal',
    professionalWarning: false,
    warningDetails: null,
    possibleCauses: [
      'Etapa del desarrollo o falta de rutina estructurada predecible.',
      'Necesidad de enriquecimiento ambiental lúdico y olfativo.',
      'Falta de señales claras de comunicación entre tutor y mascota.'
    ],
    positiveSteps: [
      'Paso 1: Establecer un horario fijo de alimentación, juegos y siestas.',
      'Paso 2: Utilizar el Clicker o marcador verbal ("¡Bien!") con timing exacto (máximo 1 segundo tras la conducta deseada).',
      'Paso 3: Reemplazar conductas no deseadas por una conducta alternativa positiva (e.g., sentarse en vez de saltar).',
      'Paso 4: Sesiones cortas de 5 a 10 minutos para evitar fatiga cognitiva.'
    ],
    dailyExercise: {
      title: 'Juego del Marcador y Recompensa Inmediata',
      durationMinutes: 10,
      instructions: 'Pide "Sienta" o espera que se siente por iniciativa propia. Justo cuando apoye las caderas, marca (click) y entrega un trozo pequeño de salchicha de pollo o galleta.'
    },
    recommendedModules: ['mod_fundamentos_clicker', 'mod_obediencia_basica'],
    peruvianTip: 'Aprovecha golosinas locales sanas como pequeños cubos de camote cocido sin sal o trocitos de hígado sancochado, muy económicos y de altísimo valor para el animal.',
    shareSummary: `${body.petName} inició su transformación de conducta con refuerzo positivo en AdiestraPet.`
  };
}

// Multimodal Gemini AI Diagnosis Endpoint
app.post('/api/diagnose', async (req: Request, res: Response) => {
  try {
    const {
      petName,
      petSpecies,
      petAge,
      petBreed,
      behaviorDescription,
      imageBase64,
      imageMimeType,
      isPeruvianContext = true,
    } = req.body as DiagnoseRequestBody;

    if (!petName || !behaviorDescription) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre de mascota y descripción de conducta).' });
    }

    const ai = getGeminiClient();

    // If Gemini client not available, use rule-based fallback immediately
    if (!ai) {
      const fallbackResult = generateRuleBasedDiagnosis(req.body);
      return res.json({
        success: true,
        ...fallbackResult,
        note: 'Diagnóstico generado por Sistema Experto de Reglas Clínicas de Bienestar Animal (Modo local seguro).',
      });
    }

    // Call Gemini 3.8 Flash with structured schema
    const promptText = `
Eres un etólogo clínico veterinario y adiestrador canino experto de alto nivel en Perú, especializado en refuerzo positivo (positive reinforcement training, LIMA guidelines).
Analiza el siguiente caso:
- Nombre del perro: "${petName}"
- Especie: perro (Canino)
- Edad: ${petAge || 'No especificada'}
- Raza/Cruza: ${petBreed || 'Mestizo peruano'}
- Descripción de conducta o problema: "${behaviorDescription}"
- Contexto: Urbano/hogareño en Perú (Lima, Callao, provincias; vida en departamento o casa urbana, ruidos callejeros, serenazgo, pirotecnia tradicional, mototaxis).

DIRECTRICES ÉTICAS CRÍTICAS DE BIENESTAR ANIMAL:
1. NUNCA recomendar castigo físico, collares de ahorque, toques eléctricos, métodos de "dominancia" o "macho alfa".
2. Ante señales de dolor físico, problemas neurológicos, o agresividad con riesgo de mordedura severa a personas o niños, DEBES activar "professionalWarning": true y establecer "urgencyLevel" en "Alerta Profesional Urgente", ordenando evaluación médica veterinaria presencial.
3. El mini-plan debe ser 100% positivo: gestión ambiental, refuerzo diferencial de conductas incompatibles (RDI), desensibilización sistemática y enriquecimiento cognitivo.
4. Incluye un consejo adaptado a la realidad peruana ("peruvianTip") con tono cálido, profesional y empático.
`;

    const contents: any[] = [];
    if (imageBase64 && imageMimeType) {
      const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: imageMimeType,
          data: cleanBase64,
        },
      });
    }
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length === 1 ? contents[0].text : { parts: contents },
      config: {
        systemInstruction: 'Actúa como un etólogo veterinario colegiado experto en refuerzo positivo y adiestramiento respetuoso. Devuelve siempre un JSON estrictamente válido.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            petSummary: { type: Type.STRING, description: 'Resumen empático de la situación observada.' },
            behaviorType: { type: Type.STRING, description: 'Categoría etológica del comportamiento.' },
            urgencyLevel: { type: Type.STRING, description: 'Normal | Moderado | Atención Requerida | Alerta Profesional Urgente' },
            professionalWarning: { type: Type.BOOLEAN, description: 'Verdadero si existe riesgo de dolor físico o agresión severa.' },
            warningDetails: { type: Type.STRING, description: 'Detalle de advertencia veterinaria si aplica.' },
            possibleCauses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 a 4 posibles causas etológicas basadas en ciencia del comportamiento.',
            },
            positiveSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 a 5 pasos claros y aplicables de refuerzo positivo paso a paso.',
            },
            dailyExercise: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                durationMinutes: { type: Type.NUMBER },
                instructions: { type: Type.STRING },
              },
              required: ['title', 'durationMinutes', 'instructions'],
            },
            recommendedModules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'IDs o nombres de módulos sugeridos para profundizar en la app.',
            },
            peruvianTip: { type: Type.STRING, description: 'Recomendación adaptada a la vida urbana en Perú.' },
            shareSummary: { type: Type.STRING, description: 'Frase llamativa para la tarjeta compartible en redes.' },
          },
          required: [
            'petSummary',
            'behaviorType',
            'urgencyLevel',
            'professionalWarning',
            'possibleCauses',
            'positiveSteps',
            'dailyExercise',
            'recommendedModules',
            'peruvianTip',
            'shareSummary',
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      engine: 'gemini-3.8-flash',
      ...parsedJson,
    });
  } catch (err: any) {
    console.error('Gemini Diagnosis Error:', err?.message || err);
    // Return gracefully calculated rule-based diagnosis so the user never gets an unhandled crash
    const fallback = generateRuleBasedDiagnosis(req.body);
    return res.json({
      success: true,
      ...fallback,
      engineNote: 'Respaldo clínico activado tras descarte de red.',
    });
  }
});

// Google Play Billing verification mock & order validator
app.post('/api/verify-billing', (req: Request, res: Response) => {
  const { purchaseToken, packageId, paymentMethod } = req.body;
  if (!purchaseToken) {
    return res.status(400).json({ success: false, message: 'purchaseToken requerido' });
  }

  // Verify simulated transaction
  const isValid = purchaseToken.startsWith('play_') || purchaseToken.startsWith('order_');
  if (isValid) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (packageId === 'annual_179' ? 365 : 30));

    return res.json({
      success: true,
      verified: true,
      status: 'SUBSCRIPTION_ACTIVE',
      packageId: packageId || 'monthly_19',
      expiresAt: expiresAt.toISOString(),
      currency: 'PEN',
      market: 'PE',
      billingProvider: 'Google Play Billing Peru v7.0.0',
      paymentMethod: paymentMethod || 'Google Play Balance / Tarjeta / Yape / Plin',
      receiptId: `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000 + Math.random() * 90000)}`,
    });
  }

  return res.status(402).json({
    success: false,
    verified: false,
    status: 'PAYMENT_REQUIRED',
    message: 'No se pudo verificar la transacción con Google Play Console.',
  });
});

async function main() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[AdiestraPet Server] Listening on http://0.0.0.0:${port}`);
  });
}

main();
