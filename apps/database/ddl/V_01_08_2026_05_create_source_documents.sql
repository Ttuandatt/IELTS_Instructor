-- CreateTable
CREATE TABLE "source_documents" (
    "id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "source_documents_uploaded_by_idx" ON "source_documents"("uploaded_by");

-- CreateIndex
CREATE INDEX "source_documents_status_idx" ON "source_documents"("status");

-- AddForeignKey
ALTER TABLE "source_documents" ADD CONSTRAINT "source_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
