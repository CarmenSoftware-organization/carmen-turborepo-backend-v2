/*
  Warnings:

  - The values [tax_id] on the enum `enum_business_unit_config_key` will be removed. If these variants are still used in the database, this will fail.
  - The values [FIFO,AVG] on the enum `enum_calculation_method` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "enum_business_unit_config_key_new" AS ENUM ('hotel', 'company', 'tax_no', 'branch_no', 'calculation_method', 'currency_base', 'date_format', 'long_time_format', 'short_time_format', 'timezone', 'perpage', 'amount', 'quantity', 'recipe');
ALTER TYPE "enum_business_unit_config_key" RENAME TO "enum_business_unit_config_key_old";
ALTER TYPE "enum_business_unit_config_key_new" RENAME TO "enum_business_unit_config_key";
DROP TYPE "enum_business_unit_config_key_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "enum_calculation_method_new" AS ENUM ('average', 'fifo');
ALTER TYPE "enum_calculation_method" RENAME TO "enum_calculation_method_old";
ALTER TYPE "enum_calculation_method_new" RENAME TO "enum_calculation_method";
DROP TYPE "enum_calculation_method_old";
COMMIT;
