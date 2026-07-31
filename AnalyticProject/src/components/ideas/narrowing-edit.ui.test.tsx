import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { NarrowingEditForm } from '@/components/ideas/NarrowingEditForm';

describe('NarrowingEditForm UI', () => {
  it('shows edit controls for narrowed idea', () => {
    const html = renderToStaticMarkup(
      <NarrowingEditForm
        ideaId="idea-1"
        status="narrowed"
        featuresExcludedToFitDeadline={['SSO']}
        mainAction="rank"
        concreteResult="shortlist"
      />,
    );

    expect(html).toContain('Сужение объёма');
    expect(html).toContain('Пересчитать оценки');
    expect(html).toContain('SSO');
  });

  it('hides form for excluded idea', () => {
    const html = renderToStaticMarkup(
      <NarrowingEditForm
        ideaId="idea-2"
        status="excluded"
        featuresExcludedToFitDeadline={[]}
        mainAction={null}
        concreteResult={null}
      />,
    );

    expect(html).toBe('');
  });
});
