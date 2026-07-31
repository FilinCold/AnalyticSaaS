import { inngest } from '@/lib/inngest/client';
import { executeIdeaRescore } from '@/lib/idea/rescore';
import { prisma } from '@/lib/prisma';

export type IdeaRescorePayload = {
  ideaId: string;
};

export async function handleIdeaRescore(
  payload: IdeaRescorePayload,
): Promise<void> {
  await executeIdeaRescore(payload.ideaId, { prisma });
}

export const ideaRescoreJob = inngest.createFunction(
  {
    id: 'idea-rescore',
    triggers: [{ event: 'idea/rescore' }],
  },
  async ({ event }) => {
    await handleIdeaRescore(event.data as IdeaRescorePayload);
  },
);

export async function enqueueIdeaRescore(payload: IdeaRescorePayload) {
  return inngest.send({
    name: 'idea/rescore',
    data: payload,
  });
}
