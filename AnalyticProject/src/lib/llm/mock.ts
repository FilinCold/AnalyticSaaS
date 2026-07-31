import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { ZodType } from 'zod';

import {
  LlmRetriableError,
  type CompleteStructuredOpts,
  type LlmProvider,
} from './types';

export type MockLlmProviderOptions = {
  /** Default fixture basename (without .json). Default: extract-pains */
  fixture?: string;
  /** If set, return this string as the model body (invalid JSON / bad shape tests). */
  rawResponse?: string;
  fixtureDir?: string;
};

function defaultFixtureDir(): string {
  return path.join(process.cwd(), 'fixtures', 'llm');
}

function parseAndValidate<T>(raw: string, schema: ZodType<T>): T {
  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch (cause) {
    throw new LlmRetriableError('LLM returned invalid JSON', { cause });
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new LlmRetriableError(
      `LLM JSON failed schema validation: ${parsed.error.message}`,
      { cause: parsed.error },
    );
  }
  return parsed.data;
}

/** Reads fixtures from fixtures/llm/ — no network. */
export class MockLlmProvider implements LlmProvider {
  private readonly fixture: string;
  private readonly rawResponse: string | undefined;
  private readonly fixtureDir: string;

  constructor(opts: MockLlmProviderOptions = {}) {
    this.fixture = opts.fixture ?? 'extract-pains';
    this.rawResponse = opts.rawResponse;
    this.fixtureDir = opts.fixtureDir ?? defaultFixtureDir();
  }

  async completeStructured<T>(opts: CompleteStructuredOpts<T>): Promise<T> {
    if (this.rawResponse !== undefined) {
      return parseAndValidate(this.rawResponse, opts.schema);
    }

    const name = opts.fixture ?? this.fixture;
    const filePath = path.join(this.fixtureDir, `${name}.json`);
    let raw: string;
    try {
      raw = readFileSync(filePath, 'utf8');
    } catch (cause) {
      throw new LlmRetriableError(`Mock LLM fixture not found: ${name}`, {
        cause,
      });
    }
    return parseAndValidate(raw, opts.schema);
  }
}
