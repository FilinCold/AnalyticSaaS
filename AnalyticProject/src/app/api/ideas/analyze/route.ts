import { ZodError } from 'zod';

import type { PipelineTrigger } from '@/domain/types';
import { enqueuePipelineRun } from '@/jobs/pipeline.run';
import { requireAuth } from '@/lib/auth/get-session';
import { MANUAL_COOLDOWN_MS } from '@/lib/pipeline/constants';
import { toAnalyzeAcceptedResponse } from '@/lib/pipeline/serialize';
import { prisma } from '@/lib/prisma';
import { SYSTEM_FEED_TOPIC } from '@/lib/signal/system-feed';
import { analyzeBodySchema } from '@/lib/validation/analyze';

function validationError(error: ZodError) {
  const message = error.issues[0]?.message ?? 'Ошибка валидации';
  return Response.json(
    { error: message, code: 'VALIDATION_ERROR' },
    { status: 400 },
  );
}

/** Manual re-run of system feed pipeline for any authenticated user. */
export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  let body: unknown = {};
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Некорректный JSON' }, { status: 400 });
    }
  }

  const parsed = analyzeBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const trigger = (parsed.data.trigger ?? 'manual') as PipelineTrigger;

  const research = await prisma.research.findFirst({
    where: { topic: SYSTEM_FEED_TOPIC },
    select: { id: true },
  });

  if (!research) {
    return Response.json(
      {
        error:
          'Лента ещё не создана. Сначала нажмите «Обновить ленту», чтобы загрузить сигналы.',
        code: 'NO_SYSTEM_FEED',
      },
      { status: 422 },
    );
  }

  const signalCount = await prisma.signal.count({
    where: { researchId: research.id },
  });
  if (signalCount < 1) {
    return Response.json(
      {
        error: 'Нет сигналов. Сначала нажмите «Обновить ленту».',
        code: 'NO_SIGNALS',
      },
      { status: 422 },
    );
  }

  const activeRun = await prisma.pipelineRun.findFirst({
    where: {
      researchId: research.id,
      status: { in: ['queued', 'running'] },
    },
    select: { id: true },
  });
  if (activeRun) {
    return Response.json(
      {
        error: 'Анализ уже выполняется',
        code: 'PIPELINE_ACTIVE',
      },
      { status: 409 },
    );
  }

  if (trigger === 'manual') {
    const recentManual = await prisma.pipelineRun.findFirst({
      where: {
        researchId: research.id,
        trigger: 'manual',
        createdAt: { gt: new Date(Date.now() - MANUAL_COOLDOWN_MS) },
      },
      select: { id: true },
    });
    if (recentManual) {
      return Response.json(
        {
          error: 'Подождите несколько минут перед повторным запуском',
          code: 'COOLDOWN',
        },
        { status: 409 },
      );
    }
  }

  const run = await prisma.pipelineRun.create({
    data: {
      researchId: research.id,
      status: 'queued',
      trigger,
    },
  });

  try {
    await enqueuePipelineRun({
      researchId: research.id,
      pipelineRunId: run.id,
      trigger,
    });
  } catch {
    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        error: 'Очередь задач недоступна',
        finishedAt: new Date(),
      },
    });
    return Response.json(
      {
        error: 'Очередь задач недоступна',
        hint: 'Запустите в другом терминале: npm run inngest:dev',
        code: 'ENQUEUE_FAILED',
      },
      { status: 502 },
    );
  }

  return Response.json(toAnalyzeAcceptedResponse(run), { status: 202 });
}
