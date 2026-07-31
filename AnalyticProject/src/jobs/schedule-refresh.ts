import { inngest } from '@/lib/inngest/client';
import { SCHEDULE_REFRESH_CRON } from '@/lib/pipeline/constants';
import { runScheduleRefresh } from '@/lib/pipeline/schedule-refresh';

/**
 * Daily cron: enqueue scheduled pipeline runs for due researches.
 * Also accepts event trigger for local/dev manual runs.
 */
export const scheduleRefreshJob = inngest.createFunction(
  {
    id: 'research-schedule-refresh',
    triggers: [
      { cron: SCHEDULE_REFRESH_CRON },
      { event: 'research/schedule-refresh' },
    ],
  },
  async () => {
    return runScheduleRefresh();
  },
);

export async function enqueueScheduleRefresh() {
  return inngest.send({
    name: 'research/schedule-refresh',
    data: {},
  });
}
