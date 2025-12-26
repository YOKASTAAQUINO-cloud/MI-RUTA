
import { GoogleGenAI, Type } from "@google/genai";
import { TaskCategory } from "../types";

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIPrioritization = async (tasks: string[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Categoriza y prioriza estas tareas para una mujer emprendedora en marketing digital/negocios en red. Enfócate en maximizar las Actividades Generadoras de Ingresos (AGI/IPA). Responde en español. Tareas: ${tasks.join(', ')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: [TaskCategory.IPA, TaskCategory.MAINTENANCE, TaskCategory.PERSONAL, TaskCategory.ADMIN] 
            },
            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
            reasoning: { type: Type.STRING, description: "Explicación en español de por qué esta tarea tiene esta prioridad." }
          },
          required: ['title', 'category', 'priority']
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const getMindsetAffirmation = async () => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Genera una afirmación poderosa y de alta vibración para una mujer emprendedora hoy. Manténla corta, directa y empoderadora. Responde en español.",
  });
  return response.text;
};

export const getCoachingResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: `Eres 'Flow', una asistente personal de alto nivel y coach de negocios para mujeres emprendedoras exitosas. Tu tono es elegante, alentador, estratégico y firme respecto al enfoque. Las ayudas a evitar el 'trabajo ocupado' y a mantenerse en su 'Zona de Genio', lo que significa enfocarse en Actividades Generadoras de Ingresos (AGI) como prospección, cierre y creación de contenido. Sé concisa, habla en español y brinda un apoyo profundo.`
    }
  });
  return response.text;
};

export const generateContentStrategy = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crea una idea de contenido (Gancho/Hook, Pie de foto/Caption, Plataformas) basada en este tema para un negocio digital liderado por una mujer: ${topic}. Responde en español.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          caption: { type: Type.STRING },
          platforms: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateFollowUpMessage = async (name: string, status: string, notes: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera un mensaje corto, elegante y profesional para enviar por WhatsApp o Instagram a un prospecto de negocio. 
    Nombre del prospecto: ${name}
    Estado del prospecto: ${status}
    Notas/Contexto: ${notes}
    El tono debe ser de alta vibración, empoderador y nada "pesado" o desesperado. Enfócate en servir y conectar. Responde solo con el texto del mensaje en español.`,
  });
  return response.text;
};
