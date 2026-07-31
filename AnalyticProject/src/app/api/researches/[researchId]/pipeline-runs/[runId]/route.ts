import { requireAuth } from '@/lib/auth/get-session';
import { toPipelineRunResponse } from '@/lib/pipeline/serialize';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ researchId: string; runId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { researchId, runId } = await context.params;

  const research = await prisma.research.findFirst({
    where: { id: researchId, userId: authResult.id },
    select: { id: true },
  });

  if (!research) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  const run = await prisma.pipelineRun.findFirst({
    where: { id: runId, researchId: research.id },
  });

  if (!run) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  return Response.json(toPipelineRunResponse(run));
}
