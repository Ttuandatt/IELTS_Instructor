-- CreateTable
CREATE TABLE "prompt_tags" (
    "prompt_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "prompt_tags_pkey" PRIMARY KEY ("prompt_id","tag_id")
);

-- CreateIndex
CREATE INDEX "prompt_tags_tag_id_idx" ON "prompt_tags"("tag_id");

-- AddForeignKey
ALTER TABLE "prompt_tags" ADD CONSTRAINT "prompt_tags_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_tags" ADD CONSTRAINT "prompt_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "topic_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
