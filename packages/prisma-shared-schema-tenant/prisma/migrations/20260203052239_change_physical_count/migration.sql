/*
  Warnings:

  - You are about to drop the column `end_date` on the `tb_spot_check` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `tb_spot_check` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `tb_spot_check` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `tb_spot_check_detail` table. All the data in the column will be lost.
  - You are about to drop the `tb_count_stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_count_stock_comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_count_stock_detail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_count_stock_detail_comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "enum_physical_count_period_status" AS ENUM ('draft', 'counting', 'completed');

-- CreateEnum
CREATE TYPE "enum_physical_count_status" AS ENUM ('pending', 'in_progress', 'completed');

-- AlterEnum
ALTER TYPE "enum_spot_check_status" ADD VALUE 'reviewing';

-- DropForeignKey
ALTER TABLE "tb_count_stock" DROP CONSTRAINT "tb_count_stock_location_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_count_stock_comment" DROP CONSTRAINT "tb_count_stock_comment_count_stock_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_count_stock_detail" DROP CONSTRAINT "tb_count_stock_detail_count_stock_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_count_stock_detail" DROP CONSTRAINT "tb_count_stock_detail_product_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_count_stock_detail_comment" DROP CONSTRAINT "tb_count_stock_detail_comment_count_stock_detail_id_fkey";

-- AlterTable
ALTER TABLE "tb_spot_check" DROP COLUMN "end_date",
DROP COLUMN "size",
DROP COLUMN "start_date",
ADD COLUMN     "end_count_date" TIMESTAMPTZ(6),
ADD COLUMN     "physical_count_type" "enum_physical_count_type" NOT NULL DEFAULT 'yes',
ADD COLUMN     "product_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "product_total" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "start_count_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tb_spot_check_detail" DROP COLUMN "qty",
ADD COLUMN     "count_qty" DECIMAL(20,5) DEFAULT 0,
ADD COLUMN     "diff_qty" DECIMAL(20,5) DEFAULT 0,
ADD COLUMN     "inventory_unit_id" UUID,
ADD COLUMN     "on_hand_qty" DECIMAL(20,5) DEFAULT 0,
ADD COLUMN     "product_code" VARCHAR,
ADD COLUMN     "product_sku" VARCHAR;

-- DropTable
DROP TABLE "tb_count_stock";

-- DropTable
DROP TABLE "tb_count_stock_comment";

-- DropTable
DROP TABLE "tb_count_stock_detail";

-- DropTable
DROP TABLE "tb_count_stock_detail_comment";

-- DropEnum
DROP TYPE "enum_count_stock_status";

-- CreateTable
CREATE TABLE "tb_physical_count_period" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "counting_period_from_date" TIMESTAMPTZ(6) NOT NULL,
    "counting_period_to_date" TIMESTAMPTZ(6) NOT NULL,
    "status" "enum_physical_count_period_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_physical_count_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_physical_count_period_comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "physical_count_period_id" UUID NOT NULL,
    "type" "enum_comment_type" NOT NULL DEFAULT 'user',
    "user_id" UUID,
    "message" TEXT,
    "attachments" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_physical_count_period_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_physical_count" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "period_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "location_code" VARCHAR,
    "location_name" VARCHAR,
    "physical_count_type" "enum_physical_count_type" NOT NULL DEFAULT 'yes',
    "description" TEXT,
    "status" "enum_physical_count_status" NOT NULL DEFAULT 'pending',
    "start_counting_at" TIMESTAMPTZ(6),
    "start_counting_by_id" UUID,
    "completed_at" TIMESTAMPTZ(6),
    "completed_by_id" UUID,
    "product_counted" INTEGER NOT NULL DEFAULT 0,
    "product_total" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_physical_count_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_physical_count_comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "physical_count_id" UUID NOT NULL,
    "type" "enum_comment_type" NOT NULL DEFAULT 'user',
    "user_id" UUID,
    "message" TEXT,
    "attachments" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_physical_count_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_physical_count_detail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "physical_count_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" VARCHAR NOT NULL,
    "product_code" VARCHAR NOT NULL,
    "product_sku" VARCHAR NOT NULL,
    "inventory_unit_id" UUID NOT NULL,
    "on_hand_qty" DECIMAL(20,5) NOT NULL,
    "counted_qty" DECIMAL(20,5) NOT NULL,
    "diff_qty" DECIMAL(20,5) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_physical_count_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_physical_count_detail_comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "physical_count_detail_id" UUID NOT NULL,
    "type" "enum_comment_type" NOT NULL DEFAULT 'user',
    "user_id" UUID,
    "message" TEXT,
    "attachments" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_physical_count_detail_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tb_physical_count_period_counting_period_from_date_counting_idx" ON "tb_physical_count_period"("counting_period_from_date", "counting_period_to_date");

-- CreateIndex
CREATE UNIQUE INDEX "physical_count_period_delete_at_u" ON "tb_physical_count_period"("counting_period_from_date", "counting_period_to_date", "deleted_at");

-- CreateIndex
CREATE INDEX "tb_physical_count_period_id_location_id_idx" ON "tb_physical_count"("period_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "physical_count_delete_at_u" ON "tb_physical_count"("period_id", "location_id", "deleted_at");

-- CreateIndex
CREATE INDEX "tb_physical_count_detail_physical_count_id_product_id_idx" ON "tb_physical_count_detail"("physical_count_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "physical_count_detail_delete_at_u" ON "tb_physical_count_detail"("physical_count_id", "product_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "tb_spot_check_detail" ADD CONSTRAINT "tb_spot_check_detail_inventory_unit_id_fkey" FOREIGN KEY ("inventory_unit_id") REFERENCES "tb_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_physical_count_period_comment" ADD CONSTRAINT "tb_physical_count_period_comment_physical_count_period_id_fkey" FOREIGN KEY ("physical_count_period_id") REFERENCES "tb_physical_count_period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_physical_count" ADD CONSTRAINT "tb_physical_count_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "tb_physical_count_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_physical_count" ADD CONSTRAINT "tb_physical_count_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "tb_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_physical_count_comment" ADD CONSTRAINT "tb_physical_count_comment_physical_count_id_fkey" FOREIGN KEY ("physical_count_id") REFERENCES "tb_physical_count"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_physical_count_detail" ADD CONSTRAINT "tb_physical_count_detail_physical_count_id_fkey" FOREIGN KEY ("physical_count_id") REFERENCES "tb_physical_count"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_physical_count_detail" ADD CONSTRAINT "tb_physical_count_detail_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "tb_product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_physical_count_detail" ADD CONSTRAINT "tb_physical_count_detail_inventory_unit_id_fkey" FOREIGN KEY ("inventory_unit_id") REFERENCES "tb_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_physical_count_detail_comment" ADD CONSTRAINT "tb_physical_count_detail_comment_physical_count_detail_id_fkey" FOREIGN KEY ("physical_count_detail_id") REFERENCES "tb_physical_count_detail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
