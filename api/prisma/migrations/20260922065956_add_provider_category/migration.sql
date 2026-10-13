-- AlterTable
ALTER TABLE "ProviderApplication" ADD COLUMN     "category" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "category" TEXT[] DEFAULT ARRAY[]::TEXT[];
