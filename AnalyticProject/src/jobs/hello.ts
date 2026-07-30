import { inngest } from '@/lib/inngest/client';

export type HelloPayload = {
  message: string;
  runId?: string;
};

export function onHelloProcessed(payload: HelloPayload): void {
  console.log('[hello]', payload.message, payload.runId ?? '');
}

export async function handleHelloJob(
  payload: HelloPayload,
  process: (payload: HelloPayload) => void = onHelloProcessed,
): Promise<void> {
  process(payload);
}

export const helloJob = inngest.createFunction(
  {
    id: 'hello',
    triggers: [{ event: 'app/hello' }],
  },
  async ({ event }) => {
    await handleHelloJob(event.data as HelloPayload);
  },
);

export async function enqueueHelloJob(payload: HelloPayload) {
  return inngest.send({
    name: 'app/hello',
    data: payload,
  });
}
