import { requireAuth } from '@/lib/auth/get-session';
import { ingestAdapterSignals } from '@/domain/signals/ingest';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ researchId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { researchId } = await context.params;
  const research = await prisma.research.findFirst({
    where: { id: researchId, userId: authResult.id },
    select: { id: true, topic: true, keywords: true },
  });

  if (!research) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  const result = await ingestAdapterSignals(research);

  return Response.json(
    {
      ingestedCount: result.ingestedCount,
      bySource: result.bySource,
      errors: result.errors,
    },
    { status: 200 },
  );
}
