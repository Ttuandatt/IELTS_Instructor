-- AlterTable
ALTER TABLE "submissions_reading" ADD COLUMN     "lesson_id" TEXT;

-- AlterTable
ALTER TABLE "submissions_writing" ADD COLUMN     "lesson_id" TEXT;

-- CreateIndex
CREATE INDEX "submissions_reading_lesson_id_idx" ON "submissions_reading"("lesson_id");

-- CreateIndex
CREATE INDEX "submissions_writing_lesson_id_idx" ON "submissions_writing"("lesson_id");

-- AddForeignKey
ALTER TABLE "submissions_reading" ADD CONSTRAINT "submissions_reading_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_writing" ADD CONSTRAINT "submissions_writing_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
