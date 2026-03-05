-- CreateTable
CREATE TABLE "tb_report_template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "report_type" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "filters" JSONB DEFAULT '{}',
    "options" JSONB DEFAULT '{}',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_report_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_report_template_type" ON "tb_report_template"("report_type");
