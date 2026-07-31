import { ZodError } from 'zod';

import { requireAuth } from '@/lib/auth/get-session';
import { maybeTriggerInitialPipeline } from '@/lib/pipeline/maybe-trigger-initial';
import { prisma } from '@/lib/prisma';
import { toSignalResponse } from '@/lib/signal/serialize';
import { createManualSignalSchema } from '@/lib/validation/signal';

type RouteContext = {
  params: Promise<{ researchId: string }>;
};

function validationError(error: ZodError) {
  const message = error.issues[0]?.message ?? 'Ошибка валидации';
  return Response.json({ error: message, code: 'VALIDATION_ERROR' }, { status: 400 });
}

async function findOwnedResearch(researchId: string, userId: string) {
  return prisma.research.findFirst({
    where: { id: researchId, userId },
    select: { id: true },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { researchId } = await context.params;
  const research = await findOwnedResearch(researchId, authResult.id);

  if (!research) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  const signals = await prisma.signal.findMany({
    where: { researchId: research.id },
    orderBy: { capturedAt: 'desc' },
  });

  return Response.json({
    signals: signals.map(toSignalResponse),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { researchId } = await context.params;
  const research = await findOwnedResearch(researchId, authResult.id);

  if (!research) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = createManualSignalSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const signal = await prisma.signal.create({
    data: {
      researchId: research.id,
      sourceType: 'manual',
      rawText: parsed.data.rawText,
      capturedAt: new Date(),
    },
  });

  await maybeTriggerInitialPipeline(research.id);

  return Response.json(toSignalResponse(signal), { status: 201 });
}
