-- CreateTable
CREATE TABLE "submissions_writing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "prompt_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL,
    "scores" JSONB,
    "feedback" JSONB,
    "model_tier" "ModelTier" NOT NULL DEFAULT 'CHEAP',
    "model_name" VARCHAR(50),
    "turnaround_ms" INTEGER,
    "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scored_at" TIMESTAMPTZ,
    "instructor_override_score" DOUBLE PRECISION,
    "instructor_comment" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "lesson_id" UUID,
    "state" "SubmissionState" NOT NULL DEFAULT 'SUBMITTED',
    "instructor_scores" JSONB,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "prompt_version" VARCHAR(10) NOT NULL DEFAULT 'v1',
    "tokens_input" INTEGER,
    "tokens_output" INTEGER,

    CONSTRAINT "submissions_writing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submissions_writing_user_id_created_at_idx" ON "submissions_writing"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "submissions_writing_prompt_id_idx" ON "submissions_writing"("prompt_id");

-- CreateIndex
CREATE INDEX "submissions_writing_processing_status_idx" ON "submissions_writing"("processing_status");

-- CreateIndex
CREATE INDEX "submissions_writing_reviewed_by_idx" ON "submissions_writing"("reviewed_by");

-- CreateIndex
CREATE INDEX "submissions_writing_lesson_id_idx" ON "submissions_writing"("lesson_id");

-- CreateIndex
CREATE INDEX "submissions_writing_lesson_id_state_idx" ON "submissions_writing"("lesson_id", "state");

-- CreateIndex
CREATE INDEX "submissions_writing_user_id_state_idx" ON "submissions_writing"("user_id", "state");

-- AddForeignKey
ALTER TABLE "submissions_writing" ADD CONSTRAINT "submissions_writing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_writing" ADD CONSTRAINT "submissions_writing_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_writing" ADD CONSTRAINT "submissions_writing_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_writing" ADD CONSTRAINT "submissions_writing_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
