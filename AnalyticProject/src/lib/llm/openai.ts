import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { ZodType } from 'zod';

import {
  LlmRetriableError,
  type CompleteStructuredOpts,
  type LlmProvider,
} from './types';

export type OpenAiProviderOptions = {
  apiKey: string;
  model?: string;
  /** OpenAI-compatible base URL (e.g. OpenRouter). */
  baseURL?: string;
  /** Optional OpenRouter attribution headers. */
  defaultHeaders?: Record<string, string>;
  client?: OpenAI;
};

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_TEMPERATURE = 0.2;

export class OpenAiProvider implements LlmProvider {
  private readonly client: OpenAI;
  readonly model: string;
  readonly baseURL: string | undefined;

  constructor(opts: OpenAiProviderOptions) {
    this.baseURL = opts.baseURL;
    this.model = opts.model ?? DEFAULT_MODEL;
    this.client =
      opts.client ??
      new OpenAI({
        apiKey: opts.apiKey,
        ...(opts.baseURL ? { baseURL: opts.baseURL } : {}),
        ...(opts.defaultHeaders
          ? { defaultHeaders: opts.defaultHeaders }
          : {}),
      });
  }

  async completeStructured<T>(opts: CompleteStructuredOpts<T>): Promise<T> {
    const schemaName = opts.schemaName ?? 'response';

    try {
      const completion = await this.client.beta.chat.completions.parse({
        model: this.model,
        temperature: DEFAULT_TEMPERATURE,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
        response_format: zodResponseFormat(
          opts.schema as ZodType,
          schemaName,
        ),
      });

      const message = completion.choices[0]?.message;
      if (message?.refusal) {
        throw new LlmRetriableError(
          `OpenAI refused structured output: ${message.refusal}`,
        );
      }

      const parsed = message?.parsed;
      if (parsed == null) {
        throw new LlmRetriableError('OpenAI returned empty structured output');
      }

      const validated = opts.schema.safeParse(parsed);
      if (!validated.success) {
        throw new LlmRetriableError(
          `OpenAI output failed schema validation: ${validated.error.message}`,
          { cause: validated.error },
        );
      }
      return validated.data;
    } catch (error) {
      if (error instanceof LlmRetriableError) throw error;
      throw new LlmRetriableError(
        error instanceof Error ? error.message : 'OpenAI request failed',
        { cause: error },
      );
    }
  }
}
