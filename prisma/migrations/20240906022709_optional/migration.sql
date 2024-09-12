-- AlterTable
ALTER TABLE "users" ALTER COLUMN "defaultShippingAddress" DROP NOT NULL,
ALTER COLUMN "defaultBillingAddress" DROP NOT NULL;
