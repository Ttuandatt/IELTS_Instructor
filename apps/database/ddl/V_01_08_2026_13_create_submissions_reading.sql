-- CreateTable
CREATE TABLE "submissions_reading" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "passage_id" UUID NOT NULL,
    "answers" JSONB NOT NULL,
    "score_pct" DOUBLE PRECISION NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "duration_sec" INTEGER,
    "timed_out" BOOLEAN NOT NULL DEFAULT false,
    "test_mode" VARCHAR(20) NOT NULL DEFAULT 'practice',
    "completed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lesson_id" UUID,

    CONSTRAINT "submissions_reading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submissions_reading_user_id_completed_at_idx" ON "submissions_reading"("user_id", "completed_at" DESC);

-- CreateIndex
CREATE INDEX "submissions_reading_passage_id_idx" ON "submissions_reading"("passage_id");

-- CreateIndex
CREATE INDEX "submissions_reading_lesson_id_idx" ON "submissions_reading"("lesson_id");

-- AddForeignKey
ALTER TABLE "submissions_reading" ADD CONSTRAINT "submissions_reading_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_reading" ADD CONSTRAINT "submissions_reading_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_reading" ADD CONSTRAINT "submissions_reading_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
