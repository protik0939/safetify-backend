-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('THEFT', 'ASSAULT', 'VANDALISM', 'FRAUD', 'OTHER');

-- CreateTable
CREATE TABLE "danzer_zone" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "boundary" TEXT NOT NULL,
    "severityRadius" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "danzer_zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "description" TEXT,
    "coordinates" TEXT NOT NULL,
    "severityLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_responder" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "responderId" TEXT NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_responder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "danzer_zone" ADD CONSTRAINT "danzer_zone_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_responder" ADD CONSTRAINT "incident_responder_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_responder" ADD CONSTRAINT "incident_responder_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
