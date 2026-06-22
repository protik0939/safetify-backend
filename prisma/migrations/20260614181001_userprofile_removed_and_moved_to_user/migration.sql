/*
  Warnings:

  - You are about to drop the `user_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "incident" DROP CONSTRAINT "incident_userId_fkey";

-- DropForeignKey
ALTER TABLE "incident_responder" DROP CONSTRAINT "incident_responder_responderId_fkey";

-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_userId_fkey";

-- DropTable
DROP TABLE "user_profile";

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_responder" ADD CONSTRAINT "incident_responder_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
