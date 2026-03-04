-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_id_key" ON "Post"("id");
