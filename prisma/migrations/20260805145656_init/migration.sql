-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryBatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storeName" TEXT,
    "receiptImageUrl" TEXT,
    "ocrStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT,
    "barcodeId" TEXT,
    "matchedFoodId" TEXT,
    "matchConfidence" DOUBLE PRECISION,
    "caloriesKcal" DOUBLE PRECISION,
    "proteinG" DOUBLE PRECISION,
    "carbsG" DOUBLE PRECISION,
    "fatG" DOUBLE PRECISION,
    "sodiumMg" DOUBLE PRECISION,
    "vitaminDMcg" DOUBLE PRECISION,
    "ironMg" DOUBLE PRECISION,
    "calciumMg" DOUBLE PRECISION,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "GroceryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "GroceryBatch_userId_createdAt_idx" ON "GroceryBatch"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "GroceryBatch" ADD CONSTRAINT "GroceryBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryItem" ADD CONSTRAINT "GroceryItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "GroceryBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
