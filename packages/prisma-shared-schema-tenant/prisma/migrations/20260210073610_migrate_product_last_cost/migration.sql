/*
  Warnings:

  - The values [currency_base,perpage,amount,quantity,recipe] on the enum `enum_business_unit_config_key` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "enum_business_unit_config_key_new" AS ENUM ('hotel', 'company', 'tax_no', 'branch_no', 'calculation_method', 'default_currency_id', 'date_format', 'time_format', 'date_time_format', 'long_time_format', 'short_time_format', 'timezone', 'perpage_format', 'amount_format', 'quantity_format', 'recipe_format');
ALTER TYPE "enum_business_unit_config_key" RENAME TO "enum_business_unit_config_key_old";
ALTER TYPE "enum_business_unit_config_key_new" RENAME TO "enum_business_unit_config_key";
DROP TYPE "enum_business_unit_config_key_old";
COMMIT;

-- AlterTable
ALTER TABLE "tb_product" ADD COLUMN     "last_cost" DECIMAL(20,5) DEFAULT 0,
ADD COLUMN     "last_cost_date" TIMESTAMPTZ(6),
ADD COLUMN     "last_cost_vendor" VARCHAR,
ADD COLUMN     "last_cost_vendor_id" UUID;

-- AddForeignKey
ALTER TABLE "tb_product" ADD CONSTRAINT "tb_product_last_cost_vendor_id_fkey" FOREIGN KEY ("last_cost_vendor_id") REFERENCES "tb_vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
