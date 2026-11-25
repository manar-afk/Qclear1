import { NextRequest, NextResponse } from 'next/server';
import { recommendationRequestSchema, aiRecommendationsOutputSchema } from '@/lib/schemas/aiRequestSchema';
import { enforceRateLimit, parseAndValidateBody } from '@/lib/api/routeHelpers';
import { generateStructuredJson } from '@/services/ai/vertexClient';
import { buildPrompt } from '@/services/ai/promptBuilder';
import { getOfflineGuidance } from '@/services/ai/offlineGuidance';
import { recommendationsCache } from '@/lib/cache/memoryCache';
import { aiRateLimiter } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    aiRateLimiter,
    request.headers,
    'AI recommendation rate limit exceeded. Please try again shortly.'
  );
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseAndValidateBody(request, recommendationRequestSchema);
  if (parsed.errorResponse) return parsed.errorResponse;

  const input = parsed.data;
  const cacheKey = [
    input.category,
    input.household.commuteMode,
    input.household.homeSetup.hasPurifier,
    input.household.members.hasToddler,
    input.household.members.hasElderly,
    input.household.members.hasRespiratorySensitivity,
    input.language,
    input.simpleLanguage,
  ].join('_');

  const cachedResult = recommendationsCache.get(cacheKey);
  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  const { systemInstruction, userPrompt } = buildPrompt(input);
  const aiResult = await generateStructuredJson({
    systemInstruction,
    userPrompt,
    outputSchema: aiRecommendationsOutputSchema,
    temperature: 0.2,
    logContext: 'Recommendations API',
  });

  if (aiResult) {
    const payload = {
      data: aiResult.data,
      isAIGenerated: true,
      model: aiResult.model,
      timestamp: new Date().toISOString(),
    };
    recommendationsCache.set(cacheKey, payload);
    return NextResponse.json(payload);
  }

  const fallbackPayload = {
    data: getOfflineGuidance(input),
    isAIGenerated: false,
    model: 'offline-guidance',
    timestamp: new Date().toISOString(),
  };
  recommendationsCache.set(cacheKey, fallbackPayload);
  return NextResponse.json(fallbackPayload);
}
