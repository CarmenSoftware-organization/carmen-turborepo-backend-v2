/*
  Warnings:

  - The values [transfer_header,transfer_detail] on the enum `enum_dimension_display_in` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `currency_name` on the `tb_credit_note` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `tb_good_received_note` table. All the data in the column will be lost.
  - You are about to drop the column `base_currency_name` on the `tb_jv_detail` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `tb_jv_detail` table. All the data in the column will be lost.
  - You are about to drop the column `base_currency_name` on the `tb_jv_header` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `tb_jv_header` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `tb_pricelist` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `tb_pricelist_template` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `tb_purchase_order` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `tb_purchase_request_detail` table. All the data in the column will be lost.
  - You are about to drop the column `currency_name` on the `tb_purchase_request_template_detail` table. All the data in the column will be lost.
  - You are about to drop the `tb_issue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_transfer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_transfer_comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_transfer_detail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_transfer_detail_comment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `si_date` to the `tb_stock_in` table without a default value. This is not possible if the table is not empty.
  - Added the required column `so_date` to the `tb_stock_out` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "enum_dimension_display_in_new" AS ENUM ('currency', 'exchange_rate', 'delivery_point', 'department', 'product_category', 'product_sub_category', 'product_item_group', 'product', 'location', 'vendor', 'pricelist', 'unit', 'purchase_request_header', 'purchase_request_detail', 'purchase_order_header', 'purchase_order_detail', 'goods_received_note_header', 'goods_received_note_detail', 'stock_in_header', 'stock_in_detail', 'stock_out_header', 'stock_out_detail');
ALTER TABLE "tb_dimension_display_in" ALTER COLUMN "display_in" TYPE "enum_dimension_display_in_new" USING ("display_in"::text::"enum_dimension_display_in_new");
ALTER TYPE "enum_dimension_display_in" RENAME TO "enum_dimension_display_in_old";
ALTER TYPE "enum_dimension_display_in_new" RENAME TO "enum_dimension_display_in";
DROP TYPE "enum_dimension_display_in_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "tb_transfer" DROP CONSTRAINT "tb_transfer_from_location_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_transfer" DROP CONSTRAINT "tb_transfer_to_location_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_transfer_comment" DROP CONSTRAINT "tb_transfer_comment_transfer_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_transfer_detail" DROP CONSTRAINT "tb_transfer_detail_inventory_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_transfer_detail" DROP CONSTRAINT "tb_transfer_detail_product_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_transfer_detail" DROP CONSTRAINT "tb_transfer_detail_transfer_id_fkey";

-- DropForeignKey
ALTER TABLE "tb_transfer_detail_comment" DROP CONSTRAINT "tb_transfer_detail_comment_transfer_detail_id_fkey";

-- AlterTable
ALTER TABLE "tb_credit_note" DROP COLUMN "currency_name",
ADD COLUMN     "currency_code" VARCHAR;

-- AlterTable
ALTER TABLE "tb_good_received_note" DROP COLUMN "currency_name",
ADD COLUMN     "currency_code" VARCHAR(3);

-- AlterTable
ALTER TABLE "tb_jv_detail" DROP COLUMN "base_currency_name",
DROP COLUMN "currency_name",
ADD COLUMN     "base_currency_code" VARCHAR,
ADD COLUMN     "currency_code" VARCHAR;

-- AlterTable
ALTER TABLE "tb_jv_header" DROP COLUMN "base_currency_name",
DROP COLUMN "currency_name",
ADD COLUMN     "base_currency_code" VARCHAR,
ADD COLUMN     "currency_code" VARCHAR;

-- AlterTable
ALTER TABLE "tb_pricelist" DROP COLUMN "currency_name",
ADD COLUMN     "currency_code" VARCHAR;

-- AlterTable
ALTER TABLE "tb_pricelist_template" DROP COLUMN "currency_name",
ADD COLUMN     "currency_code" VARCHAR;

-- AlterTable
ALTER TABLE "tb_purchase_order" DROP COLUMN "currency_name",
ADD COLUMN     "currency_code" VARCHAR;

-- AlterTable
ALTER TABLE "tb_purchase_request_detail" DROP COLUMN "currency_name",
ADD COLUMN     "currency_code" VARCHAR;

-- AlterTable
ALTER TABLE "tb_purchase_request_template_detail" DROP COLUMN "currency_name",
ADD COLUMN     "currency_code" VARCHAR;

-- AlterTable
ALTER TABLE "tb_stock_in" ADD COLUMN     "si_date" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "tb_stock_out" ADD COLUMN     "so_date" TIMESTAMPTZ(6) NOT NULL;

-- DropTable
DROP TABLE "tb_issue";

-- DropTable
DROP TABLE "tb_transfer";

-- DropTable
DROP TABLE "tb_transfer_comment";

-- DropTable
DROP TABLE "tb_transfer_detail";

-- DropTable
DROP TABLE "tb_transfer_detail_comment";

-- DropEnum
DROP TYPE "enum_issue_priority";

-- DropEnum
DROP TYPE "enum_issue_status";
