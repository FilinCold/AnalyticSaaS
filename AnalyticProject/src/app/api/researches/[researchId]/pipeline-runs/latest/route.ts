import { requireAuth } from '@/lib/auth/get-session';
import { toPipelineRunResponse } from '@/lib/pipeline/serialize';
import { prisma } from '@/lib/prisma';
import { SYSTEM_FEED_TOPIC } from '@/lib/signal/system-feed';

type RouteContext = {
  params: Promise<{ researchId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { researchId } = await context.params;

  const research = await prisma.research.findFirst({
    where: {
      id: researchId,
      OR: [{ userId: authResult.id }, { topic: SYSTEM_FEED_TOPIC }],
    },
    select: { id: true },
  });

  if (!research) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  const run = await prisma.pipelineRun.findFirst({
    where: { researchId: research.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!run) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  return Response.json(toPipelineRunResponse(run));
}
