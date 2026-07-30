import { enqueueHelloJob, type HelloPayload } from '@/jobs/hello';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  let payload: HelloPayload;

  try {
    payload = (await request.json()) as HelloPayload;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof payload.message !== 'string' || payload.message.length === 0) {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }

  try {
    const { ids } = await enqueueHelloJob(payload);
    return Response.json({ ok: true, eventIds: ids });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'enqueue failed';
    console.error('[trigger-hello]', message);
    return Response.json(
      {
        error: 'Failed to enqueue hello job',
        hint: 'Start Inngest Dev Server: npm run inngest:dev (http://localhost:8288)',
        detail: message,
      },
      { status: 502 },
    );
  }
}
