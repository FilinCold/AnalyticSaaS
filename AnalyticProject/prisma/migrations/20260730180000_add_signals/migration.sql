-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "research_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL DEFAULT 'manual',
    "source_url" TEXT,
    "raw_text" TEXT NOT NULL,
    "normalized_text" TEXT,
    "author_hint" TEXT,
    "captured_at" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "signals_research_id_idx" ON "signals"("research_id");

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
