import { GoogleGenAI } from '@google/genai';
import { ZodSchema } from 'zod';
import { getEnv } from '@/lib/config/config';

let cachedClient: GoogleGenAI | null = null;
let initialized = false;

/**
 * Returns the GoogleGenAI client configured in Vertex AI mode with ADC.
 * Returns null if GOOGLE_CLOUD_PROJECT is not set or SDK fails to initialize.
 */
export function getVertexClient(): GoogleGenAI | null {
  if (initialized) {
    return cachedClient;
  }

  initialized = true;
  const env = getEnv();

  if (!env.GOOGLE_CLOUD_PROJECT) {
    console.info('[VertexAI] GOOGLE_CLOUD_PROJECT is not configured. QCLEAR running in Curated Offline Guidance mode.');
    return null;
  }

  try {
    cachedClient = new GoogleGenAI({
      vertexai: true, // Lowercase vertexai SDK option
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GOOGLE_CLOUD_LOCATION,
    });
    console.info(`[VertexAI] Initialized with project "${env.GOOGLE_CLOUD_PROJECT}" in location "${env.GOOGLE_CLOUD_LOCATION}".`);
    return cachedClient;
  } catch (err) {
    console.warn('[VertexAI] Failed to initialize GoogleGenAI in Vertex mode. Falling back to offline guidance:', err);
    cachedClient = null;
    return null;
  }
}

export interface StructuredGenerationOptions<T> {
  systemInstruction: string;
  userPrompt: string;
  outputSchema: ZodSchema<T>;
  temperature?: number;
  logContext?: string;
}

/**
 * Invokes Gemini via Vertex AI, strips markdown fences, parses JSON, and validates
 * against the supplied Zod schema. Returns null if Vertex is unconfigured or fails.
 */
export async function generateStructuredJson<T>({
  systemInstruction,
  userPrompt,
  outputSchema,
  temperature = 0.2,
  logContext = 'VertexAI',
}: StructuredGenerationOptions<T>): Promise<{ data: T; model: string } | null> {
  const env = getEnv();
  const vertexClient = getVertexClient();

  if (!vertexClient || !env.GOOGLE_CLOUD_PROJECT) {
    return null;
  }

  try {
    const response = await vertexClient.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        responseMimeType: 'application/json',
        temperature,
      },
    });

    const responseText = response.text?.trim() || '';
    const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsedJson = JSON.parse(cleanedJson);
    const validation = outputSchema.safeParse(parsedJson);

    if (!validation.success) {
      console.warn(`[${logContext}] Gemini output schema validation failed:`, validation.error);
      return null;
    }

    return { data: validation.data, model: env.GEMINI_MODEL };
  } catch (err: unknown) {
    console.warn(`[${logContext}] Vertex AI call failed or timed out:`, err);
    return null;
  }
}
