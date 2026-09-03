-- AlterTable: batches carry receipt-level spend and a truncation flag
ALTER TABLE "GroceryBatch" ADD COLUMN     "totalSpend" DOUBLE PRECISION,
                           ADD COLUMN     "currency" TEXT,
                           ADD COLUMN     "itemsTruncated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: real mass, price and classification per item
ALTER TABLE "GroceryItem" ADD COLUMN     "packGrams" DOUBLE PRECISION,
                          ADD COLUMN     "linePrice" DOUBLE PRECISION,
                          ADD COLUMN     "foodGroup" TEXT,
                          ADD COLUMN     "novaGroup" INTEGER,
                          ADD COLUMN     "nutriScore" TEXT,
                          ADD COLUMN     "sugarG" DOUBLE PRECISION,
                          ADD COLUMN     "fiberG" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "ageYears" INTEGER,
    "sex" TEXT,
    "activityFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.4,
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "units" TEXT NOT NULL DEFAULT 'metric',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "FoodMatch" (
    "id" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceRef" TEXT,
    "found" BOOLEAN NOT NULL DEFAULT true,
    "foodGroup" TEXT,
    "novaGroup" INTEGER,
    "nutriScore" TEXT,
    "caloriesKcal" DOUBLE PRECISION,
    "proteinG" DOUBLE PRECISION,
    "carbsG" DOUBLE PRECISION,
    "fatG" DOUBLE PRECISION,
    "sugarG" DOUBLE PRECISION,
    "fiberG" DOUBLE PRECISION,
    "sodiumMg" DOUBLE PRECISION,
    "vitaminDMcg" DOUBLE PRECISION,
    "ironMg" DOUBLE PRECISION,
    "calciumMg" DOUBLE PRECISION,
    "matchConfidence" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodMatch_normalizedName_key" ON "FoodMatch"("normalizedName");
CREATE INDEX "FoodMatch_fetchedAt_idx" ON "FoodMatch"("fetchedAt");
CREATE INDEX "GroceryItem_batchId_idx" ON "GroceryItem"("batchId");
CREATE INDEX "GroceryBatch_userId_purchasedAt_idx" ON "GroceryBatch"("userId", "purchasedAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
