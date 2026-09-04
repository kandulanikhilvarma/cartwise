-- AlterTable
ALTER TABLE "FoodMatch" ADD COLUMN     "additives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "GroceryItem" ADD COLUMN     "additives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "matchSource" TEXT;
