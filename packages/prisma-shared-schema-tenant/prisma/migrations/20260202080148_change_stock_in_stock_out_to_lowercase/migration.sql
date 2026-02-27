/*
  Warnings:

  - The values [STOCK_IN,STOCK_OUT] on the enum `enum_adjustment_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "enum_adjustment_type_new" AS ENUM ('stock_in', 'stock_out');
ALTER TABLE "tb_adjustment_type" ALTER COLUMN "type" TYPE "enum_adjustment_type_new" USING (
  CASE "type"::text
    WHEN 'STOCK_IN' THEN 'stock_in'
    WHEN 'STOCK_OUT' THEN 'stock_out'
    ELSE "type"::text
  END::"enum_adjustment_type_new"
);
ALTER TYPE "enum_adjustment_type" RENAME TO "enum_adjustment_type_old";
ALTER TYPE "enum_adjustment_type_new" RENAME TO "enum_adjustment_type";
DROP TYPE "enum_adjustment_type_old";
COMMIT;
