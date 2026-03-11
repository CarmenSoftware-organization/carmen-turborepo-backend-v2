-- Migrate tb_report_template: old schema -> new schema
-- Old columns: report_type, filters, options, is_default, template_file_token
-- New columns: report_group, dialog, content, is_standard, allow_business_unit, deny_business_unit

-- Step 1: Rename report_type -> report_group
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" RENAME COLUMN "report_type" TO "report_group";

-- Step 2: Rename is_default -> is_standard (and change default)
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" RENAME COLUMN "is_default" TO "is_standard";
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" ALTER COLUMN "is_standard" SET DEFAULT true;

-- Step 3: Add new columns (dialog, content as NOT NULL with default for existing rows)
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" ADD COLUMN "dialog" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';

-- Step 4: Add new JSONB columns
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" ADD COLUMN "allow_business_unit" JSONB;
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" ADD COLUMN "deny_business_unit" JSONB;

-- Step 5: Drop old columns
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" DROP COLUMN IF EXISTS "filters";
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" DROP COLUMN IF EXISTS "options";
ALTER TABLE "CARMEN_SYSTEM"."tb_report_template" DROP COLUMN IF EXISTS "template_file_token";

-- Step 6: Update index (drop old, create new)
DROP INDEX IF EXISTS "CARMEN_SYSTEM"."idx_report_template_report_type";
CREATE INDEX IF NOT EXISTS "idx_report_template_report_group" ON "CARMEN_SYSTEM"."tb_report_template"("report_group");
