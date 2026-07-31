import { AdapterConfigError } from './types';
import type {
  AdapterFetchContext,
  IngestSignal,
  SourceAdapter,
} from './types';

type PhPost = {
  id?: string;
  name?: string | null;
  tagline?: string | null;
  description?: string | null;
  url?: string | null;
  createdAt?: string | null;
  votesCount?: number | null;
  user?: { name?: string | null; username?: string | null } | null;
};

type PhResponse = {
  data?: {
    posts?: {
      edges?: Array<{ node?: PhPost | null } | null>;
    };
  };
  errors?: Array<{ message?: string }>;
};

const PH_GRAPHQL = 'https://api.producthunt.com/v2/api/graphql';
const MAX_POSTS = 20;

const POSTS_QUERY = `
query Posts($first: Int!) {
  posts(first: $first, order: RANKING) {
    edges {
      node {
        id
        name
        tagline
        description
        url
        createdAt
        votesCount
        user { name username }
      }
    }
  }
}
`;

function requireToken(): string {
  const token = process.env.PRODUCTHUNT_API_TOKEN?.trim();
  if (!token) {
    throw new AdapterConfigError(
      'producthunt',
      'Product Hunt: задайте PRODUCTHUNT_API_TOKEN в env',
    );
  }
  return token;
}

/** Keyword filter client-side — PH ranking feed has no free-text search in MVP. */
function matchesKeywords(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

export const productHuntAdapter: SourceAdapter = {
  sourceType: 'producthunt',

  async fetchSignals(ctx: AdapterFetchContext): Promise<IngestSignal[]> {
    const token = requireToken();

    const response = await fetch(PH_GRAPHQL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: POSTS_QUERY,
        variables: { first: MAX_POSTS },
      }),
    });

    if (!response.ok) {
      throw new Error(`Product Hunt API: HTTP ${response.status}`);
    }

    const data = (await response.json()) as PhResponse;
    if (data.errors?.length) {
      throw new Error(
        data.errors[0]?.message ?? 'Product Hunt GraphQL error',
      );
    }

    const keywords = [...ctx.keywords, ctx.topic]
      .map((p) => p.trim())
      .filter(Boolean);

    const nodes =
      data.data?.posts?.edges
        ?.map((e) => e?.node)
        .filter((n): n is PhPost => Boolean(n)) ?? [];

    return nodes
      .map((post): IngestSignal | null => {
        const name = post.name?.trim() ?? '';
        const tagline = post.tagline?.trim() ?? '';
        const description = post.description?.trim() ?? '';
        const rawText = [name, tagline, description]
          .filter(Boolean)
          .join('\n\n');
        if (!rawText) return null;
        if (!matchesKeywords(rawText, keywords)) return null;

        return {
          sourceUrl: post.url?.trim() || undefined,
          rawText: rawText.slice(0, 50_000),
          authorHint:
            post.user?.username?.trim() ||
            post.user?.name?.trim() ||
            undefined,
          capturedAt: post.createdAt ? new Date(post.createdAt) : new Date(),
          metadata: {
            phId: post.id,
            votesCount: post.votesCount ?? undefined,
          },
        };
      })
      .filter((s): s is IngestSignal => s !== null);
  },
};
