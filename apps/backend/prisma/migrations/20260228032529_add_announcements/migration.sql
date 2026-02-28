-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "classroom_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_classroom_id_created_at_idx" ON "announcements"("classroom_id", "created_at");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
