import { requireAuth } from '@/lib/auth/get-session';

export async function GET() {
  const result = await requireAuth();

  if (result instanceof Response) {
    return result;
  }

  return Response.json({ user: result });
}
