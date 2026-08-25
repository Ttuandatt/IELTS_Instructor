-- CreateTable
CREATE TABLE "prompts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_type" "TaskType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "collection_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "min_words" INTEGER NOT NULL DEFAULT 250,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompts_task_type_idx" ON "prompts"("task_type");

-- CreateIndex
CREATE INDEX "prompts_level_idx" ON "prompts"("level");

-- CreateIndex
CREATE INDEX "prompts_status_idx" ON "prompts"("status");

-- CreateIndex
CREATE INDEX "prompts_collection_id_idx" ON "prompts"("collection_id");

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
