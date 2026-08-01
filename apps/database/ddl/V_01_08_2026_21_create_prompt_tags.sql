-- CreateTable
CREATE TABLE "_PromptTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PromptTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PromptTags_B_index" ON "_PromptTags"("B");

-- AddForeignKey
ALTER TABLE "_PromptTags" ADD CONSTRAINT "_PromptTags_A_fkey" FOREIGN KEY ("A") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptTags" ADD CONSTRAINT "_PromptTags_B_fkey" FOREIGN KEY ("B") REFERENCES "topic_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
