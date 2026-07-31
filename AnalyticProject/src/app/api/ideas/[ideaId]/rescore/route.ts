import { requireAuth } from '@/lib/auth/get-session';
import {
  findIdeaForUser,
  hasActivePipelineRun,
} from '@/lib/idea/access';
import { getIdeaDetail } from '@/lib/idea/get-detail';
import { executeIdeaRescore } from '@/lib/idea/rescore';
import { enqueueIdeaRescore } from '@/jobs/idea.rescore';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ ideaId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { ideaId } = await context.params;
  const idea = await findIdeaForUser(ideaId, authResult.id);
  if (!idea) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  if (await hasActivePipelineRun(idea.researchId)) {
    return Response.json(
      { error: 'Идёт анализ исследования. Дождитесь завершения.' },
      { status: 409 },
    );
  }

  // Sync light rescore (no LLM) so UI gets updated scores without Inngest.
  await executeIdeaRescore(ideaId, { prisma });

  // Fire-and-forget audit event; ignore enqueue errors (work already done).
  try {
    await enqueueIdeaRescore({ ideaId });
  } catch {
    // optional background mirror
  }

  const detail = await getIdeaDetail(ideaId, authResult.id);
  return Response.json(detail, { status: 200 });
}
