import type { ZodType } from 'zod';

export type LlmProviderName = 'mock' | 'openai' | 'openrouter' | 'anthropic';

export type CompleteStructuredOpts<T> = {
  schema: ZodType<T>;
  system: string;
  user: string;
  /** JSON Schema name for OpenAI structured output (default: response) */
  schemaName?: string;
  /** Mock: fixture basename under fixtures/llm/ (without .json) */
  fixture?: string;
};

export interface LlmProvider {
  completeStructured<T>(opts: CompleteStructuredOpts<T>): Promise<T>;
}

/** Invalid JSON / schema mismatch — pipeline may retry once (LLM_CONTRACT). */
export class LlmRetriableError extends Error {
  readonly retriable = true as const;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'LlmRetriableError';
  }
}
