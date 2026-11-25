import { NextRequest, NextResponse } from 'next/server';
import { ZodType, ZodTypeDef } from 'zod';
import { getClientIp, RateLimiter } from '@/lib/security/rateLimiter';

/**
 * Checks the IP-based rate limiter and returns a 429 NextResponse if exceeded,
 * or null if the request is allowed.
 */
export function enforceRateLimit(
  limiter: RateLimiter,
  headers: Headers,
  message: string
): NextResponse | null {
  const ip = getClientIp(headers);
  const status = limiter.check(ip);

  if (status.allowed) {
    return null;
  }

  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message,
      retryAfter: status.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(status.retryAfterSeconds || 60),
      },
    }
  );
}

/**
 * Safely parses a JSON request body and validates it against a Zod schema.
 * Returns either `{ data }` or `{ errorResponse }`.
 */
export async function parseAndValidateBody<T>(
  request: NextRequest,
  schema: ZodType<T, ZodTypeDef, unknown>
): Promise<{ data: T; errorResponse?: never } | { data?: never; errorResponse: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      errorResponse: NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 }),
    };
  }

  const validation = schema.safeParse(body);
  if (!validation.success) {
    return {
      errorResponse: NextResponse.json(
        {
          error: 'Validation Error',
          details: validation.error.format(),
        },
        { status: 400 }
      ),
    };
  }

  return { data: validation.data };
}
