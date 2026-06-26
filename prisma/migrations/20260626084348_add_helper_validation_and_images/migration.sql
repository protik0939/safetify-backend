-- CreateTable
CREATE TABLE "helper_validation" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "responderId" TEXT NOT NULL,
    "isTrue" BOOLEAN NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "helper_validation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_image" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "helperValidationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "helper_validation_incidentId_responderId_key" ON "helper_validation"("incidentId", "responderId");

-- AddForeignKey
ALTER TABLE "helper_validation" ADD CONSTRAINT "helper_validation_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "helper_validation" ADD CONSTRAINT "helper_validation_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_image" ADD CONSTRAINT "incident_image_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_image" ADD CONSTRAINT "incident_image_helperValidationId_fkey" FOREIGN KEY ("helperValidationId") REFERENCES "helper_validation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
