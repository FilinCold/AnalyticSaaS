import { LlmRetriableError } from '@/lib/llm';

/** Invalid JSON / schema → retry 1× then rethrow (LLM_CONTRACT). */
export async function withLlmRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof LlmRetriableError) {
      return await fn();
    }
    throw err;
  }
}
