import { ZodError } from 'zod';

import { requireAuth } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';
import { toResearchResponse } from '@/lib/research/serialize';
import { patchResearchSchema } from '@/lib/validation/research';

type RouteContext = {
  params: Promise<{ researchId: string }>;
};

function validationError(error: ZodError) {
  const message = error.issues[0]?.message ?? 'Ошибка валидации';
  return Response.json({ error: message, code: 'VALIDATION_ERROR' }, { status: 400 });
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { researchId } = await context.params;

  const research = await prisma.research.findFirst({
    where: { id: researchId, userId: authResult.id },
  });

  if (!research) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  return Response.json(toResearchResponse(research));
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { researchId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = patchResearchSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const existing = await prisma.research.findFirst({
    where: { id: researchId, userId: authResult.id },
  });

  if (!existing) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  const research = await prisma.research.update({
    where: { id: existing.id },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.topic !== undefined ? { topic: parsed.data.topic } : {}),
      ...(parsed.data.keywords !== undefined
        ? { keywords: parsed.data.keywords }
        : {}),
      ...(parsed.data.autoRefreshEnabled !== undefined
        ? { autoRefreshEnabled: parsed.data.autoRefreshEnabled }
        : {}),
    },
  });

  return Response.json(toResearchResponse(research));
}
