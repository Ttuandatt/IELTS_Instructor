-- AlterTable
ALTER TABLE "submissions_writing" ADD COLUMN     "instructor_comment" TEXT,
ADD COLUMN     "instructor_override_score" DOUBLE PRECISION,
ADD COLUMN     "reviewed_at" TIMESTAMPTZ,
ADD COLUMN     "reviewed_by" TEXT;

-- CreateIndex
CREATE INDEX "submissions_writing_reviewed_by_idx" ON "submissions_writing"("reviewed_by");

-- AddForeignKey
ALTER TABLE "submissions_writing" ADD CONSTRAINT "submissions_writing_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
