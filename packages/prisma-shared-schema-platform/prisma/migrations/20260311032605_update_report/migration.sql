/*
  Warnings:

  - You are about to drop the column `filters` on the `tb_report_template` table. All the data in the column will be lost.
  - You are about to drop the column `is_default` on the `tb_report_template` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `tb_report_template` table. All the data in the column will be lost.
  - You are about to drop the column `report_type` on the `tb_report_template` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,deleted_at]` on the table `tb_report_template` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `tb_report_template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dialog` to the `tb_report_template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_group` to the `tb_report_template` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "idx_report_template_type";

-- AlterTable
ALTER TABLE "tb_report_template" DROP COLUMN "filters",
DROP COLUMN "is_default",
DROP COLUMN "options",
DROP COLUMN "report_type",
ADD COLUMN     "allow_business_unit" JSONB,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "deny_business_unit" JSONB,
ADD COLUMN     "dialog" TEXT NOT NULL,
ADD COLUMN     "is_standard" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "report_group" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_report_template_report_group" ON "tb_report_template"("report_group");

-- CreateIndex
CREATE UNIQUE INDEX "report_template_name_deleted_at_u" ON "tb_report_template"("name", "deleted_at");
