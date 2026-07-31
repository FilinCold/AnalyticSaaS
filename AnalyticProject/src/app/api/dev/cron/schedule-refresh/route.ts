import { enqueueScheduleRefresh } from '@/jobs/schedule-refresh';
import { runScheduleRefresh } from '@/lib/pipeline/schedule-refresh';

/**
 * Dev-only: run schedule-refresh logic immediately + optionally enqueue via Inngest.
 * Body: `{ "enqueue": true }` → also send research/schedule-refresh event (needs inngest:dev).
 * Default: call runScheduleRefresh() in-process (no Inngest required for DB enqueue).
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  let enqueueViaInngest = false;
  try {
    const text = await request.text();
    if (text.trim()) {
      const body = JSON.parse(text) as { enqueue?: boolean };
      enqueueViaInngest = body.enqueue === true;
    }
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (enqueueViaInngest) {
    try {
      const { ids } = await enqueueScheduleRefresh();
      return Response.json({ ok: true, mode: 'inngest', eventIds: ids });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'enqueue failed';
      console.error('[cron/schedule-refresh]', message);
      return Response.json(
        {
          error: 'Failed to enqueue schedule-refresh job',
          hint: 'Start Inngest Dev Server: npm run inngest:dev (http://localhost:8288)',
          detail: message,
        },
        { status: 502 },
      );
    }
  }

  // In-process: create runs + enqueue pipeline/run events
  try {
    const result = await runScheduleRefresh();
    return Response.json({ ok: true, mode: 'direct', ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'schedule failed';
    console.error('[cron/schedule-refresh]', message);
    return Response.json(
      {
        error: 'Failed to run schedule-refresh',
        hint: 'Start Inngest Dev Server if pipeline enqueue fails: npm run inngest:dev',
        detail: message,
      },
      { status: 502 },
    );
  }
}
