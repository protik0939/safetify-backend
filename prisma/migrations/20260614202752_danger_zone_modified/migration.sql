/*
  Warnings:

  - You are about to drop the column `boundary` on the `danzer_zone` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `danzer_zone` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `danzer_zone` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `danzer_zone` table. All the data in the column will be lost.
  - You are about to drop the column `severityRadius` on the `danzer_zone` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `danzer_zone` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `incident` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `incident` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "danzer_zone" DROP COLUMN "boundary",
DROP COLUMN "description",
DROP COLUMN "endTime",
DROP COLUMN "name",
DROP COLUMN "severityRadius",
DROP COLUMN "startTime";

-- AlterTable
ALTER TABLE "incident" DROP COLUMN "coordinates",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "severityLevel" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;
