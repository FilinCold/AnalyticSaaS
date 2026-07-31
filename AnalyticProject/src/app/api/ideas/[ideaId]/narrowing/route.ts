import { requireAuth } from '@/lib/auth/get-session';
import { findIdeaForUser } from '@/lib/idea/access';
import { getIdeaDetail } from '@/lib/idea/get-detail';
import { reestimateBuildDays } from '@/lib/idea/rescore';
import { prisma } from '@/lib/prisma';
import { patchNarrowingSchema } from '@/lib/validation/narrowing';
import type { Prisma } from '@prisma/client';

type RouteContext = {
  params: Promise<{ ideaId: string }>;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { ideaId } = await context.params;
  const idea = await findIdeaForUser(ideaId, authResult.id);
  if (!idea) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = patchNarrowingSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? 'Ошибка валидации';
    return Response.json({ error: message }, { status: 400 });
  }

  const previousExcluded = asStringArray(idea.featuresExcludedToFitDeadline);
  const nextExcluded = parsed.data.featuresExcludedToFitDeadline;
  const estimatedBuildDays = reestimateBuildDays({
    currentEstimatedBuildDays: idea.estimatedBuildDays ?? 14,
    previousExcluded,
    nextExcluded,
  });

  await prisma.idea.update({
    where: { id: ideaId },
    data: {
      featuresExcludedToFitDeadline: nextExcluded as Prisma.InputJsonValue,
      estimatedBuildDays,
      ...(parsed.data.mainAction !== undefined
        ? { mainAction: parsed.data.mainAction }
        : {}),
      ...(parsed.data.concreteResult !== undefined
        ? { concreteResult: parsed.data.concreteResult }
        : {}),
    },
  });

  const detail = await getIdeaDetail(ideaId, authResult.id);
  return Response.json(detail, { status: 200 });
}
