import { requireAuth } from '@/lib/auth/get-session';
import { ingestAdapterSignals } from '@/domain/signals/ingest';
import { getOrCreateSystemResearch } from '@/lib/signal/system-feed';

/** Primary ingest for ideas feed — system Research, all adapters. */
export async function POST() {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const research = await getOrCreateSystemResearch(authResult.id);
  const result = await ingestAdapterSignals({
    id: research.id,
    topic: research.topic,
    keywords: research.keywords,
  });

  return Response.json(
    {
      researchId: result.researchId,
      ingestedCount: result.ingestedCount,
      bySource: result.bySource,
      errors: result.errors,
    },
    { status: 200 },
  );
}
