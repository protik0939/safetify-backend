/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `admin_profile` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `security_personnel_profile` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `super_admin_profile` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `user_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admin_profile" DROP COLUMN "avatarUrl";

-- AlterTable
ALTER TABLE "security_personnel_profile" DROP COLUMN "avatarUrl";

-- AlterTable
ALTER TABLE "super_admin_profile" DROP COLUMN "avatarUrl";

-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "avatarUrl";
