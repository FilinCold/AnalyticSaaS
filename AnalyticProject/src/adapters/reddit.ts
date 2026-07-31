import { AdapterConfigError } from './types';
import type {
  AdapterFetchContext,
  IngestSignal,
  SourceAdapter,
} from './types';

type RedditTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type RedditChild = {
  data?: {
    id?: string;
    title?: string | null;
    selftext?: string | null;
    author?: string | null;
    permalink?: string | null;
    url?: string | null;
    created_utc?: number | null;
    subreddit?: string | null;
    score?: number | null;
  };
};

type RedditListing = {
  data?: {
    children?: RedditChild[];
  };
};

const TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const SEARCH_URL = 'https://oauth.reddit.com/search';
const MAX_RESULTS = 20;

function requireCreds(): { clientId: string; clientSecret: string } {
  const clientId = process.env.REDDIT_CLIENT_ID?.trim();
  const clientSecret = process.env.REDDIT_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new AdapterConfigError(
      'reddit',
      'Reddit: задайте REDDIT_CLIENT_ID и REDDIT_CLIENT_SECRET в env',
    );
  }
  return { clientId, clientSecret };
}

function buildQuery(ctx: AdapterFetchContext): string {
  const parts = [...ctx.keywords, ctx.topic]
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'saas OR "micro saas"';
}

async function getAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USER_AGENT?.trim() || 'AnalyticSaaS/0.1',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Reddit token: HTTP ${response.status}`);
  }

  const data = (await response.json()) as RedditTokenResponse;
  if (!data.access_token) {
    throw new Error(
      data.error_description || data.error || 'Reddit: нет access_token',
    );
  }
  return data.access_token;
}

export const redditAdapter: SourceAdapter = {
  sourceType: 'reddit',

  async fetchSignals(ctx: AdapterFetchContext): Promise<IngestSignal[]> {
    const { clientId, clientSecret } = requireCreds();
    const token = await getAccessToken(clientId, clientSecret);
    const query = buildQuery(ctx);

    const url = new URL(SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(MAX_RESULTS));
    url.searchParams.set('sort', 'relevance');
    url.searchParams.set('type', 'link');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'User-Agent':
          process.env.REDDIT_USER_AGENT?.trim() || 'AnalyticSaaS/0.1',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit search: HTTP ${response.status}`);
    }

    const listing = (await response.json()) as RedditListing;
    const children = listing.data?.children ?? [];

    return children
      .map((child): IngestSignal | null => {
        const post = child.data;
        if (!post) return null;
        const title = post.title?.trim() ?? '';
        const body = post.selftext?.trim() ?? '';
        const rawText = [title, body].filter(Boolean).join('\n\n');
        if (!rawText) return null;

        const permalink = post.permalink?.trim();
        const sourceUrl = permalink
          ? `https://www.reddit.com${permalink}`
          : post.url?.trim() || undefined;

        return {
          sourceUrl,
          rawText: rawText.slice(0, 50_000),
          authorHint: post.author?.trim() || undefined,
          capturedAt:
            typeof post.created_utc === 'number'
              ? new Date(post.created_utc * 1000)
              : new Date(),
          metadata: {
            redditId: post.id,
            subreddit: post.subreddit ?? undefined,
            score: post.score ?? undefined,
          },
        };
      })
      .filter((s): s is IngestSignal => s !== null);
  },
};
