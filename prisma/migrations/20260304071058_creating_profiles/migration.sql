-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "PoliceRank" AS ENUM ('IGP', 'ADDITIONAL_IGP', 'DIG', 'ADDITIONAL_DIG', 'POLICE_COMMISSIONER', 'ADDITIONAL_POLICE_COMMISSIONER', 'SP', 'ADDITIONAL_SP', 'SENIOR_ASP', 'ASP', 'INSPECTOR', 'SUB_INSPECTOR', 'SERGEANT', 'ASSISTANT_SUB_INSPECTOR', 'NAYEK', 'CONSTABLE');

-- CreateTable
CREATE TABLE "admin_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_personnel_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT,
    "avatarUrl" TEXT,
    "rank" "PoliceRank",
    "bloodGroup" "BloodGroup",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_personnel_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admin_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "super_admin_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "address" TEXT,
    "bloodGroup" "BloodGroup",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_profile_userId_key" ON "admin_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "security_personnel_profile_userId_key" ON "security_personnel_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_profile_userId_key" ON "super_admin_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_userId_key" ON "user_profile"("userId");

-- AddForeignKey
ALTER TABLE "admin_profile" ADD CONSTRAINT "admin_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_personnel_profile" ADD CONSTRAINT "security_personnel_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin_profile" ADD CONSTRAINT "super_admin_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
