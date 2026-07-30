import { requireAuth } from '@/lib/auth/get-session';

/** F2-03 stub — empty feed until F5/F6 populate ideas. */
export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  return Response.json({
    ideas: [],
    stats: {
      recommendedCount: 0,
      narrowedCount: 0,
      excludedCount: 0,
      lastPipelineFinishedAt: null,
    },
  });
}
