-- CreateTable
CREATE TABLE "pain_clusters" (
    "id" TEXT NOT NULL,
    "research_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "frequency_hint" TEXT,
    "signal_ids" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "pain_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "research_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'candidate',
    "primary_user" TEXT,
    "problem" TEXT,
    "input_data_type" TEXT,
    "main_action" TEXT,
    "concrete_result" TEXT,
    "pay_reason" TEXT,
    "one_job_template" TEXT,
    "one_job_score" INTEGER,
    "ai_buildability_score" INTEGER,
    "first_sale_potential" INTEGER,
    "estimated_build_days" INTEGER,
    "opportunity_score" INTEGER,
    "build_time_confidence" TEXT,
    "main_technical_risk" TEXT,
    "required_integrations" JSONB NOT NULL DEFAULT '[]',
    "features_excluded_to_fit_deadline" JSONB NOT NULL DEFAULT '[]',
    "risk_of_developer_help" TEXT,
    "fourteen_day_build_plan" JSONB,
    "first_customer_persona" TEXT,
    "where_to_find_customers" TEXT,
    "pain_statement" TEXT,
    "short_offer" TEXT,
    "primary_acquisition_channel" TEXT,
    "how_to_show_result" TEXT,
    "recommended_cta" TEXT,
    "simple_price" TEXT,
    "how_to_get_first_payment" TEXT,
    "continue_criteria" TEXT,
    "stop_criteria" TEXT,
    "exclusion_reasons" JSONB NOT NULL DEFAULT '[]',
    "supporting_signal_ids" JSONB NOT NULL DEFAULT '[]',
    "supporting_cluster_ids" JSONB NOT NULL DEFAULT '[]',
    "score_breakdown" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_runs" (
    "id" TEXT NOT NULL,
    "research_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "trigger" TEXT NOT NULL,
    "current_step" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "pipeline_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pain_clusters_research_id_idx" ON "pain_clusters"("research_id");

-- Note: DATABASE.md prefers partial WHERE status='recommended'; full composite kept for Prisma portability.
-- CreateIndex
CREATE INDEX "ideas_research_id_status_opportunity_score_idx" ON "ideas"("research_id", "status", "opportunity_score" DESC);

-- CreateIndex
CREATE INDEX "pipeline_runs_research_id_created_at_idx" ON "pipeline_runs"("research_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "pain_clusters" ADD CONSTRAINT "pain_clusters_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
