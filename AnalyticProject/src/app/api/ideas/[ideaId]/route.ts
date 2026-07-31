import { requireAuth } from '@/lib/auth/get-session';
import { getIdeaDetail } from '@/lib/idea/get-detail';

type RouteContext = {
  params: Promise<{ ideaId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { ideaId } = await context.params;
  const idea = await getIdeaDetail(ideaId, authResult.id);

  if (!idea) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  return Response.json(idea);
}
