-- CreateEnum
CREATE TYPE "enum_calculation_method" AS ENUM ('average', 'fifo');

-- AlterTable
ALTER TABLE "tb_business_unit" ADD COLUMN     "amount_format" JSONB,
ADD COLUMN     "branch_no" TEXT,
ADD COLUMN     "calculation_method" "enum_calculation_method" NOT NULL DEFAULT 'average',
ADD COLUMN     "company_address" TEXT,
ADD COLUMN     "company_email" TEXT,
ADD COLUMN     "company_name" TEXT,
ADD COLUMN     "company_tel" TEXT,
ADD COLUMN     "company_zip_code" TEXT,
ADD COLUMN     "date_format" TEXT DEFAULT 'yyyy-MM-dd',
ADD COLUMN     "date_time_format" TEXT DEFAULT 'yyyy-MM-dd HH:mm:ss',
ADD COLUMN     "default_currency_id" UUID,
ADD COLUMN     "hotel_address" TEXT,
ADD COLUMN     "hotel_email" TEXT,
ADD COLUMN     "hotel_name" TEXT,
ADD COLUMN     "hotel_tel" TEXT,
ADD COLUMN     "hotel_zip_code" TEXT,
ADD COLUMN     "long_time_format" TEXT DEFAULT 'HH:mm:ss',
ADD COLUMN     "perpage_format" JSONB,
ADD COLUMN     "quantity_format" JSONB,
ADD COLUMN     "recipe_format" JSONB,
ADD COLUMN     "short_time_format" TEXT DEFAULT 'HH:mm',
ADD COLUMN     "tax_no" TEXT,
ADD COLUMN     "time_format" TEXT DEFAULT 'HH:mm:ss',
ADD COLUMN     "timezone" TEXT DEFAULT 'Asia/Bangkok';
