-- CreateEnum
CREATE TYPE "enum_rounding_type" AS ENUM ('round', 'round_ceiling', 'round_floor');

-- CreateEnum
CREATE TYPE "enum_cuisine_region" AS ENUM ('ASIA', 'EUROPE', 'AMERICAS', 'AFRICA', 'MIDDLE_EAST', 'OCEANIA');

-- CreateEnum
CREATE TYPE "enum_recipe_difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "enum_recipe_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "enum_allergen_severity" AS ENUM ('TRACE', 'MAY_CONTAIN', 'PRESENT', 'HIGH');

-- CreateEnum
CREATE TYPE "enum_contamination_risk" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "enum_ingredient_type" AS ENUM ('product', 'recipe');

-- CreateEnum
CREATE TYPE "enum_temperature_unit" AS ENUM ('c', 'f');

-- AlterTable
ALTER TABLE "tb_attachment" ALTER COLUMN "s3_token" SET DATA TYPE VARCHAR,
ALTER COLUMN "s3_folder" SET DATA TYPE VARCHAR,
ALTER COLUMN "file_name" SET DATA TYPE VARCHAR,
ALTER COLUMN "file_ext" SET DATA TYPE VARCHAR,
ALTER COLUMN "file_type" SET DATA TYPE VARCHAR,
ALTER COLUMN "file_url" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "tb_config_running_code" ALTER COLUMN "type" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "tb_jv_header" ALTER COLUMN "jv_type" SET DATA TYPE VARCHAR,
ALTER COLUMN "jv_no" SET DATA TYPE VARCHAR;

-- CreateTable
CREATE TABLE "tb_recipe_cuisines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "note" VARCHAR,
    "is_active" BOOLEAN DEFAULT true,
    "region" "enum_cuisine_region" NOT NULL,
    "popular_dishes" JSONB NOT NULL DEFAULT '[]',
    "key_ingredients" JSONB NOT NULL DEFAULT '[]',
    "info" JSONB DEFAULT '{}',
    "dimension" JSONB DEFAULT '[]',
    "doc_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_cuisines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe_equipment_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "note" VARCHAR,
    "is_active" BOOLEAN DEFAULT true,
    "info" JSONB DEFAULT '{}',
    "dimension" JSONB DEFAULT '[]',
    "doc_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_equipment_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe_equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "category_id" UUID,
    "category_name" VARCHAR,
    "brand" VARCHAR,
    "model" VARCHAR,
    "serial_no" VARCHAR,
    "capacity" VARCHAR,
    "power_rating" VARCHAR,
    "station" VARCHAR,
    "operation_instructions" VARCHAR,
    "safety_notes" VARCHAR,
    "cleaning_instructions" VARCHAR,
    "maintenance_schedule" VARCHAR,
    "last_maintenance_date" TIMESTAMPTZ(6),
    "next_maintenance_date" TIMESTAMPTZ(6),
    "note" VARCHAR,
    "is_active" BOOLEAN DEFAULT true,
    "is_poolable" BOOLEAN DEFAULT false,
    "available_qty" INTEGER DEFAULT 0,
    "total_qty" INTEGER DEFAULT 0,
    "usage_count" INTEGER DEFAULT 0,
    "average_usage_time" DECIMAL(20,5) DEFAULT 0,
    "attachments" JSONB DEFAULT '[]',
    "manuals_urls" JSONB DEFAULT '[]',
    "info" JSONB DEFAULT '{}',
    "dimension" JSONB DEFAULT '[]',
    "doc_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "note" VARCHAR,
    "is_active" BOOLEAN DEFAULT true,
    "parent_id" UUID,
    "level" INTEGER NOT NULL DEFAULT 1,
    "default_cost_settings" JSONB NOT NULL DEFAULT '{}',
    "default_margins" JSONB NOT NULL DEFAULT '{}',
    "info" JSONB DEFAULT '{}',
    "dimension" JSONB DEFAULT '[]',
    "doc_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "note" VARCHAR,
    "is_active" BOOLEAN DEFAULT true,
    "images" JSONB DEFAULT '[]',
    "category_id" UUID NOT NULL,
    "cuisine_id" UUID NOT NULL,
    "difficulty" "enum_recipe_difficulty" NOT NULL DEFAULT 'MEDIUM',
    "base_yield" DECIMAL(20,5) NOT NULL,
    "base_yield_unit" VARCHAR NOT NULL,
    "default_variant_id" UUID,
    "prep_time" INTEGER NOT NULL DEFAULT 0,
    "cook_time" INTEGER NOT NULL DEFAULT 0,
    "total_ingredient_cost" DECIMAL(20,5) NOT NULL DEFAULT 0,
    "labor_cost" DECIMAL(20,5) NOT NULL DEFAULT 0,
    "overhead_cost" DECIMAL(20,5) NOT NULL DEFAULT 0,
    "cost_per_portion" DECIMAL(20,5) NOT NULL DEFAULT 0,
    "suggested_price" DECIMAL(20,5),
    "selling_price" DECIMAL(20,5),
    "target_food_cost_percentage" DECIMAL(20,5) DEFAULT 33.00,
    "actual_food_cost_percentage" DECIMAL(20,5),
    "gross_margin" DECIMAL(20,5),
    "gross_margin_percentage" DECIMAL(20,5),
    "labor_cost_percentage" DECIMAL(20,5) DEFAULT 30.00,
    "overhead_percentage" DECIMAL(20,5) DEFAULT 20.00,
    "carbon_footprint" DECIMAL(20,5) DEFAULT 0,
    "deduct_from_stock" BOOLEAN NOT NULL DEFAULT true,
    "status" "enum_recipe_status" NOT NULL DEFAULT 'DRAFT',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "allergens" JSONB NOT NULL DEFAULT '[]',
    "published_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe_ingredient" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sequence_no" INTEGER DEFAULT 1,
    "name" VARCHAR NOT NULL,
    "note" VARCHAR,
    "recipe_id" UUID NOT NULL,
    "ingredient_type" "enum_ingredient_type" NOT NULL,
    "product_id" UUID,
    "sub_recipe_id" UUID,
    "qty" DECIMAL(20,5) NOT NULL,
    "ingredient_unit_id" UUID NOT NULL,
    "inventory_qty" DECIMAL(20,5),
    "inventory_unit_id" UUID,
    "conversion_factor" DECIMAL(20,5),
    "cost_per_unit" DECIMAL(20,5) NOT NULL DEFAULT 0,
    "wastage_percentage" DECIMAL(20,5) NOT NULL DEFAULT 0,
    "net_cost" DECIMAL(20,5) NOT NULL DEFAULT 0,
    "wastage_cost" DECIMAL(20,5) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,
    "tb_recipe_yield_variantId" UUID,

    CONSTRAINT "tb_recipe_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe_preparation_step" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "title" VARCHAR,
    "description" TEXT NOT NULL,
    "images" JSONB DEFAULT '[]',
    "videos" JSONB DEFAULT '[]',
    "duration" INTEGER,
    "temperature" DECIMAL(20,5),
    "temperature_unit" "enum_temperature_unit" DEFAULT 'c',
    "equipment" JSONB NOT NULL DEFAULT '[]',
    "techniques" JSONB NOT NULL DEFAULT '[]',
    "chef_notes" TEXT,
    "safety_warnings" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_preparation_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe_version" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "recipe_data" JSONB NOT NULL,
    "ingredients_data" JSONB NOT NULL,
    "steps_data" JSONB NOT NULL,
    "variants_data" JSONB NOT NULL,
    "change_summary" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe_pricing_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "variant_id" UUID,
    "cost_per_portion" DECIMAL(20,5) NOT NULL,
    "selling_price" DECIMAL(20,5) NOT NULL,
    "food_cost_percentage" DECIMAL(20,5) NOT NULL,
    "gross_margin" DECIMAL(20,5) NOT NULL,
    "competitor_avg_price" DECIMAL(20,5),
    "competitor_min_price" DECIMAL(20,5),
    "competitor_max_price" DECIMAL(20,5),
    "change_reason" VARCHAR,
    "effective_date" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_pricing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recipe_yield_variant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "variant_name" VARCHAR NOT NULL,
    "variant_unit" VARCHAR NOT NULL,
    "variant_quantity" DECIMAL(20,5) NOT NULL,
    "conversion_rate" DECIMAL(20,5) NOT NULL,
    "cost_per_unit" DECIMAL(20,5),
    "selling_price" DECIMAL(20,5),
    "food_cost_percentage" DECIMAL(20,5),
    "gross_margin" DECIMAL(20,5),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "shelf_life" INTEGER,
    "wastage_rate" DECIMAL(20,5),
    "min_order_quantity" INTEGER,
    "max_order_quantity" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by_id" UUID,

    CONSTRAINT "tb_recipe_yield_variant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tb_recipe_cuisines_region_idx" ON "tb_recipe_cuisines"("region");

-- CreateIndex
CREATE INDEX "recipe_cuisines_name_idx" ON "tb_recipe_cuisines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_cuisines_name_u" ON "tb_recipe_cuisines"("name", "deleted_at");

-- CreateIndex
CREATE INDEX "recipe_equipment_category_name_idx" ON "tb_recipe_equipment_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_equipment_category_name_u" ON "tb_recipe_equipment_category"("name", "deleted_at");

-- CreateIndex
CREATE INDEX "recipe_equipment_code_name_idx" ON "tb_recipe_equipment"("code", "name");

-- CreateIndex
CREATE INDEX "recipe_equipment_name_idx" ON "tb_recipe_equipment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_equipment_code_name_u" ON "tb_recipe_equipment"("code", "name", "deleted_at");

-- CreateIndex
CREATE INDEX "recipe_code_idx" ON "tb_recipe"("code");

-- CreateIndex
CREATE INDEX "recipe_name_idx" ON "tb_recipe"("name");

-- CreateIndex
CREATE INDEX "recipe_code_name_idx" ON "tb_recipe"("code", "name");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_code_name_u" ON "tb_recipe"("code", "name", "deleted_at");

-- AddForeignKey
ALTER TABLE "tb_recipe_equipment" ADD CONSTRAINT "tb_recipe_equipment_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tb_recipe_equipment_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_recipe_category" ADD CONSTRAINT "tb_recipe_category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "tb_recipe_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe" ADD CONSTRAINT "tb_recipe_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tb_recipe_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe" ADD CONSTRAINT "tb_recipe_cuisine_id_fkey" FOREIGN KEY ("cuisine_id") REFERENCES "tb_recipe_cuisines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe" ADD CONSTRAINT "tb_recipe_default_variant_id_fkey" FOREIGN KEY ("default_variant_id") REFERENCES "tb_recipe_yield_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_ingredient" ADD CONSTRAINT "tb_recipe_ingredient_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "tb_recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_ingredient" ADD CONSTRAINT "tb_recipe_ingredient_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "tb_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_ingredient" ADD CONSTRAINT "tb_recipe_ingredient_sub_recipe_id_fkey" FOREIGN KEY ("sub_recipe_id") REFERENCES "tb_recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_ingredient" ADD CONSTRAINT "tb_recipe_ingredient_ingredient_unit_id_fkey" FOREIGN KEY ("ingredient_unit_id") REFERENCES "tb_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_ingredient" ADD CONSTRAINT "tb_recipe_ingredient_inventory_unit_id_fkey" FOREIGN KEY ("inventory_unit_id") REFERENCES "tb_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_ingredient" ADD CONSTRAINT "tb_recipe_ingredient_tb_recipe_yield_variantId_fkey" FOREIGN KEY ("tb_recipe_yield_variantId") REFERENCES "tb_recipe_yield_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_preparation_step" ADD CONSTRAINT "tb_recipe_preparation_step_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "tb_recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_version" ADD CONSTRAINT "tb_recipe_version_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "tb_recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_pricing_history" ADD CONSTRAINT "tb_recipe_pricing_history_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "tb_recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_pricing_history" ADD CONSTRAINT "tb_recipe_pricing_history_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "tb_recipe_yield_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recipe_yield_variant" ADD CONSTRAINT "tb_recipe_yield_variant_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "tb_recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
