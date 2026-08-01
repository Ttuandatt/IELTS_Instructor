-- CreateTable
CREATE TABLE "topic_tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "topic_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topic_tags_name_key" ON "topic_tags"("name");
