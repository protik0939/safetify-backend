/*
  Warnings:

  - Added the required column `timing` to the `incident` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "incident" ADD COLUMN     "timing" TEXT NOT NULL;
