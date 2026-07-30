-- CreateTable
CREATE TABLE "researches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "keywords" TEXT[] NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "auto_refresh_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_pipeline_finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "researches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "researches_user_id_idx" ON "researches"("user_id");

-- AddForeignKey
ALTER TABLE "researches" ADD CONSTRAINT "researches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
