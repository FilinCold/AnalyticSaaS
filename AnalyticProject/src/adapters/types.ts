export type AdapterSourceType = 'hackernews' | 'producthunt' | 'reddit';

export type IngestSignal = {
  sourceUrl?: string;
  rawText: string;
  authorHint?: string;
  capturedAt: Date;
  metadata?: Record<string, unknown>;
};

export type AdapterFetchContext = {
  topic: string;
  keywords: string[];
};

export interface SourceAdapter {
  readonly sourceType: AdapterSourceType;
  fetchSignals(ctx: AdapterFetchContext): Promise<IngestSignal[]>;
}

export class AdapterConfigError extends Error {
  readonly sourceType: AdapterSourceType;

  constructor(sourceType: AdapterSourceType, message: string) {
    super(message);
    this.name = 'AdapterConfigError';
    this.sourceType = sourceType;
  }
}
