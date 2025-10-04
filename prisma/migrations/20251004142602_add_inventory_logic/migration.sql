/*
  Warnings:

  - You are about to drop the column `received_storage_location` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `reagents` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_on_hand` on the `reagents` table. All the data in the column will be lost.
  - You are about to drop the column `storage_location` on the `reagents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "received_storage_location",
ADD COLUMN     "received_storage_location_id" TEXT;

-- AlterTable
ALTER TABLE "reagents" DROP COLUMN "manufacturer",
DROP COLUMN "quantity_on_hand",
DROP COLUMN "storage_location",
ADD COLUMN     "manufacturer_id" TEXT,
ADD COLUMN     "subtype_id" TEXT,
ADD COLUMN     "type_id" TEXT;

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "storage_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reagent_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "reagent_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reagent_subtypes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,

    CONSTRAINT "reagent_subtypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_lots" (
    "id" TEXT NOT NULL,
    "reagent_id" TEXT NOT NULL,
    "order_item_id" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL,
    "expiration_date" DATE,
    "storage_location_id" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_lots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_name_key" ON "manufacturers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "storage_locations_name_key" ON "storage_locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reagent_types_name_key" ON "reagent_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reagent_subtypes_name_type_id_key" ON "reagent_subtypes"("name", "type_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_lots_order_item_id_key" ON "inventory_lots"("order_item_id");

-- AddForeignKey
ALTER TABLE "reagent_subtypes" ADD CONSTRAINT "reagent_subtypes_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "reagent_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reagents" ADD CONSTRAINT "reagents_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reagents" ADD CONSTRAINT "reagents_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "reagent_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reagents" ADD CONSTRAINT "reagents_subtype_id_fkey" FOREIGN KEY ("subtype_id") REFERENCES "reagent_subtypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_reagent_id_fkey" FOREIGN KEY ("reagent_id") REFERENCES "reagents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_storage_location_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "storage_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_received_storage_location_id_fkey" FOREIGN KEY ("received_storage_location_id") REFERENCES "storage_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
