-- Empty phones would collide on the new unique index.
UPDATE "User" SET "phone" = NULL WHERE "phone" = '';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "phone" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
