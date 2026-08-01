-- CreateTable
CREATE TABLE "lesson_submissions" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'submitted',
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_submissions_lesson_id_created_at_idx" ON "lesson_submissions"("lesson_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "lesson_submissions_user_id_idx" ON "lesson_submissions"("user_id");

-- AddForeignKey
ALTER TABLE "lesson_submissions" ADD CONSTRAINT "lesson_submissions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_submissions" ADD CONSTRAINT "lesson_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
