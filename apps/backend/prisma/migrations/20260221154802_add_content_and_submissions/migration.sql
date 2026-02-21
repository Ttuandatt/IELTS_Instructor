-- CreateEnum
CREATE TYPE "CefrLevel" AS ENUM ('A2', 'B1', 'B2', 'C1');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('mcq', 'short');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('task1', 'task2');

-- CreateEnum
CREATE TYPE "ModelTier" AS ENUM ('cheap', 'premium');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('pending', 'done', 'failed');

-- CreateTable
CREATE TABLE "passages" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "topic_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "passages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "passage_id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "answer_key" JSONB NOT NULL,
    "explanation" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "task_type" "TaskType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "topic_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "min_words" INTEGER NOT NULL DEFAULT 250,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions_reading" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "passage_id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score_pct" DOUBLE PRECISION NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "duration_sec" INTEGER,
    "timed_out" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions_writing" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL,
    "scores" JSONB,
    "feedback" JSONB,
    "model_tier" "ModelTier" NOT NULL DEFAULT 'cheap',
    "model_name" VARCHAR(50),
    "turnaround_ms" INTEGER,
    "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scored_at" TIMESTAMPTZ,

    CONSTRAINT "submissions_writing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "passages_level_idx" ON "passages"("level");

-- CreateIndex
CREATE INDEX "passages_status_idx" ON "passages"("status");

-- CreateIndex
CREATE INDEX "passages_created_at_idx" ON "passages"("created_at" DESC);

-- CreateIndex
CREATE INDEX "questions_passage_id_idx" ON "questions"("passage_id");

-- CreateIndex
CREATE INDEX "questions_passage_id_order_index_idx" ON "questions"("passage_id", "order_index");

-- CreateIndex
CREATE INDEX "prompts_task_type_idx" ON "prompts"("task_type");

-- CreateIndex
CREATE INDEX "prompts_level_idx" ON "prompts"("level");

-- CreateIndex
CREATE INDEX "prompts_status_idx" ON "prompts"("status");

-- CreateIndex
CREATE INDEX "submissions_reading_user_id_completed_at_idx" ON "submissions_reading"("user_id", "completed_at" DESC);

-- CreateIndex
CREATE INDEX "submissions_reading_passage_id_idx" ON "submissions_reading"("passage_id");

-- CreateIndex
CREATE INDEX "submissions_writing_user_id_created_at_idx" ON "submissions_writing"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "submissions_writing_prompt_id_idx" ON "submissions_writing"("prompt_id");

-- CreateIndex
CREATE INDEX "submissions_writing_processing_status_idx" ON "submissions_writing"("processing_status");

-- AddForeignKey
ALTER TABLE "passages" ADD CONSTRAINT "passages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_reading" ADD CONSTRAINT "submissions_reading_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_reading" ADD CONSTRAINT "submissions_reading_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_writing" ADD CONSTRAINT "submissions_writing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_writing" ADD CONSTRAINT "submissions_writing_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
