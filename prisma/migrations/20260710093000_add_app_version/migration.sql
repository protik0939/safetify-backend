-- CreateTable
CREATE TABLE "app_version" (
    "id" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_version_pkey" PRIMARY KEY ("id")
);
