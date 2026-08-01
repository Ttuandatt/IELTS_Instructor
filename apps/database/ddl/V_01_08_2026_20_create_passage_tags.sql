-- CreateTable
CREATE TABLE "_PassageTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PassageTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PassageTags_B_index" ON "_PassageTags"("B");

-- AddForeignKey
ALTER TABLE "_PassageTags" ADD CONSTRAINT "_PassageTags_A_fkey" FOREIGN KEY ("A") REFERENCES "passages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PassageTags" ADD CONSTRAINT "_PassageTags_B_fkey" FOREIGN KEY ("B") REFERENCES "topic_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
