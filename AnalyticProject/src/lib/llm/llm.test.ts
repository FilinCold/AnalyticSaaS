import { describe, expect, it } from 'vitest';

import {
  LlmRetriableError,
  MockLlmProvider,
  OPENROUTER_BASE_URL,
  OPENROUTER_DEFAULT_MODEL,
  OpenAiProvider,
  createLlmProvider,
  extractPainsResultSchema,
  getLlmProviderName,
  resolveLiveLlmConfig,
} from '@/lib/llm';

describe('llm', () => {
  it('T1: Mock extract pains → valid schema', async () => {
    const provider = new MockLlmProvider({ fixture: 'extract-pains' });
    const result = await provider.completeStructured({
      schema: extractPainsResultSchema,
      system: 'extract pains',
      user: 'signals…',
      fixture: 'extract-pains',
    });

    expect(result.pains).toHaveLength(2);
    expect(result.pains[0]?.frequencyHint).toBe('high');
    expect(result.pains[0]?.signalId).toMatch(/^[0-9a-f-]+$/i);
  });

  it('T2: invalid JSON from mock → LlmRetriableError', async () => {
    const provider = new MockLlmProvider({
      rawResponse: '{not-json',
    });

    await expect(
      provider.completeStructured({
        schema: extractPainsResultSchema,
        system: 'extract',
        user: 'x',
      }),
    ).rejects.toBeInstanceOf(LlmRetriableError);
  });

  it('schema reject bad shape → LlmRetriableError', async () => {
    const provider = new MockLlmProvider({
      rawResponse: JSON.stringify({ pains: [{ signalId: 1 }] }),
    });

    await expect(
      provider.completeStructured({
        schema: extractPainsResultSchema,
        system: 'extract',
        user: 'x',
      }),
    ).rejects.toBeInstanceOf(LlmRetriableError);
  });

  it('createLlmProvider defaults to mock', () => {
    const prev = process.env.LLM_PROVIDER;
    delete process.env.LLM_PROVIDER;
    expect(getLlmProviderName()).toBe('mock');
    expect(createLlmProvider()).toBeInstanceOf(MockLlmProvider);
    if (prev !== undefined) process.env.LLM_PROVIDER = prev;
  });

  it('createLlmProvider openai without key throws', () => {
    const prevProvider = process.env.LLM_PROVIDER;
    const prevKey = process.env.LLM_API_KEY;
    process.env.LLM_PROVIDER = 'openai';
    delete process.env.LLM_API_KEY;

    expect(() => createLlmProvider()).toThrow(/LLM_API_KEY/);

    if (prevProvider !== undefined) process.env.LLM_PROVIDER = prevProvider;
    else delete process.env.LLM_PROVIDER;
    if (prevKey !== undefined) process.env.LLM_API_KEY = prevKey;
  });

  it('openrouter resolves baseURL + default model slug', () => {
    const prev = {
      provider: process.env.LLM_PROVIDER,
      key: process.env.LLM_API_KEY,
      model: process.env.LLM_MODEL,
      base: process.env.LLM_BASE_URL,
    };
    process.env.LLM_PROVIDER = 'openrouter';
    process.env.LLM_API_KEY = 'sk-or-test';
    delete process.env.LLM_MODEL;
    delete process.env.LLM_BASE_URL;

    const cfg = resolveLiveLlmConfig();
    expect(cfg).toMatchObject({
      kind: 'openrouter',
      baseURL: OPENROUTER_BASE_URL,
      model: OPENROUTER_DEFAULT_MODEL,
      apiKey: 'sk-or-test',
    });
    expect(cfg.defaultHeaders?.['X-Title']).toBe('AnalyticSaaS');

    const provider = createLlmProvider();
    expect(provider).toBeInstanceOf(OpenAiProvider);
    expect((provider as OpenAiProvider).baseURL).toBe(OPENROUTER_BASE_URL);
    expect((provider as OpenAiProvider).model).toBe(OPENROUTER_DEFAULT_MODEL);

    if (prev.provider !== undefined) process.env.LLM_PROVIDER = prev.provider;
    else delete process.env.LLM_PROVIDER;
    if (prev.key !== undefined) process.env.LLM_API_KEY = prev.key;
    else delete process.env.LLM_API_KEY;
    if (prev.model !== undefined) process.env.LLM_MODEL = prev.model;
    if (prev.base !== undefined) process.env.LLM_BASE_URL = prev.base;
  });
});
