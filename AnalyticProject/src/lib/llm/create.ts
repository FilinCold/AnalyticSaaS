import { MockLlmProvider } from './mock';
import { OpenAiProvider } from './openai';
import type { LlmProvider, LlmProviderName } from './types';

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_DEFAULT_MODEL = 'openai/gpt-4o-mini';
export const OPENAI_DEFAULT_MODEL = 'gpt-4o-mini';

export type ResolvedLiveLlmConfig = {
  kind: 'openai' | 'openrouter';
  apiKey: string;
  model: string;
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
};

export function getLlmProviderName(): LlmProviderName {
  const raw = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (
    raw === 'openai' ||
    raw === 'openrouter' ||
    raw === 'anthropic' ||
    raw === 'mock'
  ) {
    return raw;
  }
  return 'mock';
}

/** Resolve live OpenAI-compatible settings (OpenAI direct or OpenRouter). */
export function resolveLiveLlmConfig(): ResolvedLiveLlmConfig {
  const name = getLlmProviderName();
  if (name !== 'openai' && name !== 'openrouter') {
    throw new Error(`resolveLiveLlmConfig: unexpected provider ${name}`);
  }

  const apiKey = process.env.LLM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(`LLM_PROVIDER=${name} requires LLM_API_KEY`);
  }

  const envBase = process.env.LLM_BASE_URL?.trim();
  const envModel = process.env.LLM_MODEL?.trim();

  if (name === 'openrouter') {
    const headers: Record<string, string> = {
      'X-Title': process.env.LLM_APP_TITLE?.trim() || 'AnalyticSaaS',
    };
    const referer = process.env.LLM_HTTP_REFERER?.trim();
    if (referer) headers['HTTP-Referer'] = referer;

    return {
      kind: 'openrouter',
      apiKey,
      model: envModel || OPENROUTER_DEFAULT_MODEL,
      baseURL: envBase || OPENROUTER_BASE_URL,
      defaultHeaders: headers,
    };
  }

  return {
    kind: 'openai',
    apiKey,
    model: envModel || OPENAI_DEFAULT_MODEL,
    ...(envBase ? { baseURL: envBase } : {}),
  };
}

/**
 * Factory from env: LLM_PROVIDER=mock|openai|openrouter|anthropic (default mock).
 * OpenRouter = OpenAI-compatible SDK + baseURL (pay-as-you-go gateway).
 * Server-only — never import from client components.
 */
export function createLlmProvider(): LlmProvider {
  const name = getLlmProviderName();

  if (name === 'mock') {
    return new MockLlmProvider({
      fixture: process.env.LLM_FIXTURE?.trim() || undefined,
    });
  }

  if (name === 'anthropic') {
    throw new Error(
      'LLM_PROVIDER=anthropic is not implemented (MVP uses OpenRouter / OpenAI)',
    );
  }

  const cfg = resolveLiveLlmConfig();
  return new OpenAiProvider({
    apiKey: cfg.apiKey,
    model: cfg.model,
    baseURL: cfg.baseURL,
    defaultHeaders: cfg.defaultHeaders,
  });
}
