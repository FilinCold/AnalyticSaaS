import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

import { resetSystemFeed } from './helpers/reset-system-feed';

type IdeasFeedJson = {
  ideas: Array<{ id: string; problem: string | null }>;
  stats: {
    recommendedCount: number;
    narrowedCount: number;
    excludedCount: number;
    lastPipelineFinishedAt: string | null;
  };
};

type ResearchListJson = {
  researches: Array<{ id: string; topic: string }>;
};

const SYSTEM_FEED_TOPIC = '__system_feed__';

async function registerFreshUser(page: Page) {
  const email =
    process.env.E2E_USER_EMAIL ??
    `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
  const password = process.env.E2E_USER_PASSWORD ?? 'e2e-password-123';

  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль', { exact: true }).fill(password);
  await page.getByLabel('Подтвердите пароль').fill(password);
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
  await expect(page).toHaveURL(/\/ideas/);
  await expect(page.getByRole('heading', { name: 'Идеи' })).toBeVisible();

  return { email, password };
}

async function waitForPipelineSucceeded(request: APIRequestContext) {
  await expect
    .poll(
      async () => {
        const res = await request.get('/api/ideas');
        if (!res.ok()) return `http:${res.status()}`;
        const data = (await res.json()) as IdeasFeedJson;
        if (data.stats.lastPipelineFinishedAt) {
          return 'succeeded';
        }
        const total =
          data.stats.recommendedCount +
          data.stats.narrowedCount +
          data.stats.excludedCount;
        return total > 0 ? 'ideas' : 'pending';
      },
      {
        timeout: 90_000,
        intervals: [1_000, 2_000, 3_000],
      },
    )
    .toMatch(/succeeded|ideas/);
}

/** If auto-initial enqueue raced Inngest sync, kick a manual analyze. */
async function maybeKickAnalyze(request: APIRequestContext) {
  const list = await request.get('/api/researches');
  if (!list.ok()) return;
  const body = (await list.json()) as ResearchListJson;
  const system = body.researches.find((r) => r.topic === SYSTEM_FEED_TOPIC);
  if (!system) return;

  const feed = await request.get('/api/ideas');
  if (!feed.ok()) return;
  const data = (await feed.json()) as IdeasFeedJson;
  if (data.stats.lastPipelineFinishedAt) return;

  const latest = await request.get(
    `/api/researches/${system.id}/pipeline-runs/latest`,
  );
  if (latest.ok()) {
    const run = (await latest.json()) as { status: string };
    if (run.status === 'queued' || run.status === 'running') return;
  }

  await request.post(`/api/researches/${system.id}/analyze`);
}

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

test.describe('Flow A happy path', () => {
  test.beforeAll(async () => {
    await resetSystemFeed();
    // Give Inngest Dev Server time to sync /api/inngest after both webServers are up.
    await new Promise((r) => setTimeout(r, 4000));
  });

  test('T1: register → ingest → pipeline → idea card', async ({ page }) => {
    await registerFreshUser(page);

    await page.getByRole('button', { name: 'Обновить ленту' }).click();
    await expect(page.getByText(/Добавлено сигналов:\s*[1-9]/)).toBeVisible({
      timeout: 30_000,
    });

    // Fallback if auto-initial stayed queued without worker (rare race).
    await page.waitForTimeout(8_000);
    await maybeKickAnalyze(page.request);

    await waitForPipelineSucceeded(page.request);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Идеи' })).toBeVisible();

    const feedRes = await page.request.get('/api/ideas');
    expect(feedRes.ok()).toBeTruthy();
    const feed = (await feedRes.json()) as IdeasFeedJson;

    const hasRecommended = feed.stats.recommendedCount > 0;
    const hasExcluded = feed.stats.excludedCount > 0;
    expect(hasRecommended || hasExcluded).toBeTruthy();

    if (hasRecommended) {
      const firstLink = page.locator('table tbody tr a').first();
      await expect(firstLink).toBeVisible();
      await firstLink.click();
    } else {
      await page.goto('/ideas?tab=excluded');
      const firstLink = page.locator('table tbody tr a').first();
      await expect(firstLink).toBeVisible();
      await firstLink.click();
    }

    await expect(page).toHaveURL(/\/ideas\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Одна задача' }),
    ).toBeVisible();
    await expect(
      page.getByText('Потенциал', { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Когда продолжать' }),
    ).toBeVisible();
  });
});
