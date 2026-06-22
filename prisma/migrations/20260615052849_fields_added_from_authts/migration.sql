-- AlterTable
ALTER TABLE "user" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "contactNo" TEXT,
ALTER COLUMN "bio" SET DEFAULT 'Safetify User';
