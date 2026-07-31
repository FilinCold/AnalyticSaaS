import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BuildSection } from '@/components/ideas/BuildSection';
import { IdeaCardHeader } from '@/components/ideas/IdeaCardHeader';
import { NarrowingEditForm } from '@/components/ideas/NarrowingEditForm';
import { OneJobSection } from '@/components/ideas/OneJobSection';
import { ProvenanceSection } from '@/components/ideas/ProvenanceSection';
import { SalesSection } from '@/components/ideas/SalesSection';
import { ScoresSection } from '@/components/ideas/ScoresSection';
import { getSessionUser } from '@/lib/auth/get-session';
import { getIdeaDetail } from '@/lib/idea/get-detail';

type PageProps = {
  params: Promise<{ ideaId: string }>;
};

export default async function IdeaCardPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const { ideaId } = await params;
  const idea = await getIdeaDetail(ideaId, user.id);

  if (!idea) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12">
      <IdeaCardHeader idea={idea} />
      <OneJobSection idea={idea} />
      <ScoresSection idea={idea} />
      <BuildSection idea={idea} />
      <NarrowingEditForm
        ideaId={idea.id}
        status={idea.status}
        featuresExcludedToFitDeadline={idea.featuresExcludedToFitDeadline}
        mainAction={idea.mainAction}
        concreteResult={idea.concreteResult}
      />
      <SalesSection idea={idea} />
      <ProvenanceSection idea={idea} />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/ideas" className="underline underline-offset-2">
          ← К ленте идей
        </Link>
      </p>
    </main>
  );
}
