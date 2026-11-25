import { NextRequest, NextResponse } from 'next/server';
import { askRequestSchema, askResponseSchema } from '@/lib/schemas/askSchema';
import { enforceRateLimit, parseAndValidateBody } from '@/lib/api/routeHelpers';
import { generateStructuredJson } from '@/services/ai/vertexClient';
import { buildAskPrompt } from '@/services/ai/promptBuilder';
import { getOfflineAnswer } from '@/services/ai/offlineAsk';
import { askRateLimiter } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    askRateLimiter,
    request.headers,
    'Ask QCLEAR rate limit exceeded. Please wait a minute before asking another question.'
  );
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseAndValidateBody(request, askRequestSchema);
  if (parsed.errorResponse) return parsed.errorResponse;

  const input = parsed.data;
  const { systemInstruction, userPrompt } = buildAskPrompt(input);

  const aiResult = await generateStructuredJson({
    systemInstruction,
    userPrompt,
    outputSchema: askResponseSchema,
    temperature: 0.25,
    logContext: 'Ask API',
  });

  if (aiResult) {
    return NextResponse.json({
      data: aiResult.data,
      isAIGenerated: true,
      model: aiResult.model,
      disclaimer:
        input.language === 'hi'
          ? 'गैर-चिकित्सीय मार्गदर्शन: गंभीर लक्षण होने पर चिकित्सक से सलाह लें।'
          : 'Non-medical guidance: Consult a physician for severe respiratory symptoms.',
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    data: getOfflineAnswer(input),
    isAIGenerated: false,
    model: 'offline-guidance',
    disclaimer:
      input.language === 'hi'
        ? 'गैर-चिकित्सीय मार्गदर्शन: गंभीर लक्षण होने पर चिकित्सक से सलाह लें।'
        : 'Non-medical guidance: Consult a physician for severe respiratory symptoms.',
    timestamp: new Date().toISOString(),
  });
}
