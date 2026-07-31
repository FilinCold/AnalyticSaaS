import { ZodError } from 'zod';

import { enqueuePipelineRun } from '@/jobs/pipeline.run';
import { requireAuth } from '@/lib/auth/get-session';
import { toAnalyzeAcceptedResponse } from '@/lib/pipeline/serialize';
import { prisma } from '@/lib/prisma';
import { MANUAL_COOLDOWN_MS } from '@/lib/pipeline/constants';
import {
  analyzeBodySchema,
} from '@/lib/validation/analyze';
import type { PipelineTrigger } from '@/domain/types';

type RouteContext = {
  params: Promise<{ researchId: string }>;
};

function validationError(error: ZodError) {
  const message = error.issues[0]?.message ?? 'Ошибка валидации';
  return Response.json({ error: message, code: 'VALIDATION_ERROR' }, { status: 400 });
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { researchId } = await context.params;

  const research = await prisma.research.findFirst({
    where: { id: researchId, userId: authResult.id },
    select: { id: true },
  });

  if (!research) {
    return Response.json({ error: 'Не найдено' }, { status: 404 });
  }

  let body: unknown = {};
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Некорректный JSON' }, { status: 400 });
    }
  } else {
    // Empty / missing body → defaults (trigger=manual)
    try {
      const text = await request.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch {
      return Response.json({ error: 'Некорректный JSON' }, { status: 400 });
    }
  }

  const parsed = analyzeBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const trigger = (parsed.data.trigger ?? 'manual') as PipelineTrigger;

  const signalCount = await prisma.signal.count({
    where: { researchId: research.id },
  });
  if (signalCount < 1) {
    return Response.json(
      { error: 'Нет сигналов для анализа', code: 'NO_SIGNALS' },
      { status: 422 },
    );
  }

  const activeRun = await prisma.pipelineRun.findFirst({
    where: {
      researchId: research.id,
      status: { in: ['queued', 'running'] },
    },
    select: { id: true, status: true },
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
      select: { id: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    if (recentManual) {
      return Response.json(
        {
          error: 'Повторный ручной запуск доступен через 5 минут',
          code: 'MANUAL_COOLDOWN',
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
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'enqueue failed';
    console.error('[analyze] enqueue failed', detail);
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
        error: 'Очередь задач недоступна. Запустите: npm run inngest:dev',
        code: 'ENQUEUE_FAILED',
        hint: 'Start Inngest Dev Server: npm run inngest:dev (http://localhost:8288)',
        detail,
      },
      { status: 502 },
    );
  }

  return Response.json(toAnalyzeAcceptedResponse(run), { status: 202 });
}
