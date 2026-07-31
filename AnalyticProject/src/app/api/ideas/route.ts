import { requireAuth } from '@/lib/auth/get-session';
import { listIdeasFeed, parseIdeaFeedStatus } from '@/lib/idea/list-feed';

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const url = new URL(request.url);
  const status = parseIdeaFeedStatus(url.searchParams.get('status'));
  if (status == null) {
    return Response.json(
      {
        error:
          'Некорректный status. Допустимо: recommended, narrowed, excluded, candidate',
      },
      { status: 400 },
    );
  }

  const feed = await listIdeasFeed(status);
  return Response.json(feed);
}
