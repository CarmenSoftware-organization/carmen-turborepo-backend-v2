/*
  Warnings:

  - The values [default_currency_id] on the enum `enum_business_unit_config_key` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "enum_business_unit_config_key_new" AS ENUM ('hotel', 'company', 'tax_no', 'branch_no', 'calculation_method', 'default_currency', 'date_format', 'time_format', 'date_time_format', 'long_time_format', 'short_time_format', 'timezone', 'perpage_format', 'amount_format', 'quantity_format', 'recipe_format');
ALTER TYPE "enum_business_unit_config_key" RENAME TO "enum_business_unit_config_key_old";
ALTER TYPE "enum_business_unit_config_key_new" RENAME TO "enum_business_unit_config_key";
DROP TYPE "enum_business_unit_config_key_old";
COMMIT;
