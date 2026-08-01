-- CreateTable
CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "invite_code" VARCHAR(8) NOT NULL,
    "owner_id" TEXT NOT NULL,
    "status" "ClassroomStatus" NOT NULL DEFAULT 'active',
    "max_members" INTEGER NOT NULL DEFAULT 50,
    "writing_mode" "WritingMode" NOT NULL DEFAULT 'instant',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_invite_code_key" ON "classrooms"("invite_code");

-- CreateIndex
CREATE INDEX "classrooms_invite_code_idx" ON "classrooms"("invite_code");

-- CreateIndex
CREATE INDEX "classrooms_owner_id_idx" ON "classrooms"("owner_id");

-- CreateIndex
CREATE INDEX "classrooms_status_idx" ON "classrooms"("status");

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
