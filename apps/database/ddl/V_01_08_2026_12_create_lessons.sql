-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "topic_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "content_type" "LessonContentType" NOT NULL DEFAULT 'TEXT',
    "linked_entity_id" UUID,
    "attachment_url" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "allow_submit" BOOLEAN NOT NULL DEFAULT true,
    "allow_checkscore" BOOLEAN NOT NULL DEFAULT false,
    "due_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lessons_topic_id_order_index_idx" ON "lessons"("topic_id", "order_index");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
