-- CreateTable
CREATE TABLE "passages" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "collection_id" TEXT,
    "source_document_id" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "passages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "passages_level_idx" ON "passages"("level");

-- CreateIndex
CREATE INDEX "passages_status_idx" ON "passages"("status");

-- CreateIndex
CREATE INDEX "passages_created_at_idx" ON "passages"("created_at" DESC);

-- CreateIndex
CREATE INDEX "passages_collection_id_idx" ON "passages"("collection_id");

-- CreateIndex
CREATE INDEX "passages_source_document_id_idx" ON "passages"("source_document_id");

-- AddForeignKey
ALTER TABLE "passages" ADD CONSTRAINT "passages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passages" ADD CONSTRAINT "passages_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passages" ADD CONSTRAINT "passages_source_document_id_fkey" FOREIGN KEY ("source_document_id") REFERENCES "source_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
