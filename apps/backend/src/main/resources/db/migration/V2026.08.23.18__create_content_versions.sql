-- CreateTable
CREATE TABLE "content_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_id" UUID NOT NULL,
    "entity_type" VARCHAR(20) NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "editor_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "changes" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_versions_entity_id_entity_type_idx" ON "content_versions"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "content_versions_editor_id_idx" ON "content_versions"("editor_id");

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
