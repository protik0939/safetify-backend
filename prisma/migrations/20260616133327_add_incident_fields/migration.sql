-- AlterTable
ALTER TABLE "incident" ADD COLUMN     "attackers" TEXT,
ADD COLUMN     "deathToll" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "injuryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "peopleHelped" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stories" TEXT[],
ADD COLUMN     "victim" TEXT;
