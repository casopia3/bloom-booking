ALTER TABLE "ProviderImage"
ADD COLUMN "cloudinaryPublicId" TEXT;

CREATE UNIQUE INDEX "ProviderImage_cloudinaryPublicId_key"
ON "ProviderImage"("cloudinaryPublicId");
