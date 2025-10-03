-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('pending_approval', 'partially_approved', 'fully_approved', 'rejected', 'pending_receipt', 'partially_received', 'completed');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('pending_approval', 'approved', 'rejected', 'pending_receipt', 'received');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('BRL', 'USD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY['user']::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reagents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "catalog_number" TEXT,
    "unit_of_measure" TEXT NOT NULL,
    "quantity_on_hand" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "min_stock_level" DECIMAL(65,30),
    "storage_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reagents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'pending_approval',
    "requester_name" TEXT,
    "requester_email" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "reagent_id" TEXT NOT NULL,
    "quantity_requested" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" "CurrencyType" NOT NULL,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'pending_approval',
    "justification" TEXT,
    "approver_notes" TEXT,
    "approved_by_user_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "quantity_received" DECIMAL(65,30),
    "received_at" TIMESTAMP(3),
    "received_storage_location" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "from_currency" TEXT NOT NULL DEFAULT 'USD',
    "to_currency" TEXT NOT NULL DEFAULT 'BRL',
    "rate" DECIMAL(65,30) NOT NULL,
    "rate_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_withdrawals" (
    "id" TEXT NOT NULL,
    "reagent_id" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "withdrawn_by_name" TEXT,
    "withdrawn_by_email" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reagents_catalog_number_key" ON "reagents"("catalog_number");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_from_currency_to_currency_rate_date_key" ON "exchange_rates"("from_currency", "to_currency", "rate_date");

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_reagent_id_fkey" FOREIGN KEY ("reagent_id") REFERENCES "reagents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_withdrawals" ADD CONSTRAINT "stock_withdrawals_reagent_id_fkey" FOREIGN KEY ("reagent_id") REFERENCES "reagents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_withdrawals" ADD CONSTRAINT "stock_withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
