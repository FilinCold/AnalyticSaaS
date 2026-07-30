import { ZodError } from 'zod';

import { requireAuth } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';
import { toResearchResponse } from '@/lib/research/serialize';
import { createResearchSchema } from '@/lib/validation/research';

function validationError(error: ZodError) {
  const message = error.issues[0]?.message ?? 'Ошибка валидации';
  return Response.json({ error: message, code: 'VALIDATION_ERROR' }, { status: 400 });
}

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const researches = await prisma.research.findMany({
    where: { userId: authResult.id },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({
    researches: researches.map(toResearchResponse),
  });
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = createResearchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const research = await prisma.research.create({
    data: {
      userId: authResult.id,
      title: parsed.data.title,
      topic: parsed.data.topic,
      keywords: parsed.data.keywords,
    },
  });

  return Response.json(toResearchResponse(research), { status: 201 });
}
