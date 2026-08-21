import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/modules/ai/ai.service';
import { generateDescriptionSchema } from '@/modules/ai/schemas';
import { requireRole, isAuthError } from '@/modules/auth/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'AI Product Description Generator',
    endpoint: '/api/ai/generate-description',
  });
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['SELLER', 'ADMIN']);
  if (isAuthError(auth)) {
    return auth.error;
  }

  try {
    const body = await req.json().catch(() => ({}));

    const parseResult = generateDescriptionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await AIService.generateProductDescription(parseResult.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate product description',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
