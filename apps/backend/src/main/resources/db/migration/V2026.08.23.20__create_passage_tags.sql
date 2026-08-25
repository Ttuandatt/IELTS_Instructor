-- CreateTable
CREATE TABLE "passage_tags" (
    "passage_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "passage_tags_pkey" PRIMARY KEY ("passage_id","tag_id")
);

-- CreateIndex
CREATE INDEX "passage_tags_tag_id_idx" ON "passage_tags"("tag_id");

-- AddForeignKey
ALTER TABLE "passage_tags" ADD CONSTRAINT "passage_tags_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passage_tags" ADD CONSTRAINT "passage_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "topic_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
