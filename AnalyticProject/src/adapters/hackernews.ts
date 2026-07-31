import type {
  AdapterFetchContext,
  IngestSignal,
  SourceAdapter,
} from './types';

type AlgoliaHit = {
  objectID?: string;
  title?: string | null;
  story_text?: string | null;
  url?: string | null;
  author?: string | null;
  created_at?: string | null;
  points?: number | null;
  num_comments?: number | null;
};

type AlgoliaResponse = {
  hits?: AlgoliaHit[];
};

const HN_SEARCH = 'https://hn.algolia.com/api/v1/search';
const MAX_HITS = 20;

function buildQuery(ctx: AdapterFetchContext): string {
  const parts = [...ctx.keywords, ctx.topic]
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'saas OR startup';
}

export const hackerNewsAdapter: SourceAdapter = {
  sourceType: 'hackernews',

  async fetchSignals(ctx: AdapterFetchContext): Promise<IngestSignal[]> {
    const query = buildQuery(ctx);
    const url = new URL(HN_SEARCH);
    url.searchParams.set('query', query);
    url.searchParams.set('tags', 'story');
    url.searchParams.set('hitsPerPage', String(MAX_HITS));

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Hacker News API: HTTP ${response.status}`);
    }

    const data = (await response.json()) as AlgoliaResponse;
    const hits = data.hits ?? [];

    return hits
      .map((hit): IngestSignal | null => {
        const title = hit.title?.trim() ?? '';
        const body = hit.story_text?.trim() ?? '';
        const rawText = [title, body].filter(Boolean).join('\n\n');
        if (!rawText) return null;

        const objectId = hit.objectID?.trim();
        const sourceUrl =
          hit.url?.trim() ||
          (objectId ? `https://news.ycombinator.com/item?id=${objectId}` : undefined);

        return {
          sourceUrl,
          rawText: rawText.slice(0, 50_000),
          authorHint: hit.author?.trim() || undefined,
          capturedAt: hit.created_at
            ? new Date(hit.created_at)
            : new Date(),
          metadata: {
            objectID: objectId,
            points: hit.points ?? undefined,
            numComments: hit.num_comments ?? undefined,
          },
        };
      })
      .filter((s): s is IngestSignal => s !== null);
  },
};
