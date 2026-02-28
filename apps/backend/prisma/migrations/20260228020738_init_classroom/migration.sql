-- CreateEnum
CREATE TYPE "ClassroomStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "ClassroomRole" AS ENUM ('teacher', 'student');

-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('text', 'video', 'passage', 'prompt');

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
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_members" (
    "id" TEXT NOT NULL,
    "classroom_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ClassroomRole" NOT NULL DEFAULT 'student',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "classroom_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "content_type" "LessonContentType" NOT NULL DEFAULT 'text',
    "linked_entity_id" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_invite_code_key" ON "classrooms"("invite_code");

-- CreateIndex
CREATE INDEX "classrooms_invite_code_idx" ON "classrooms"("invite_code");

-- CreateIndex
CREATE INDEX "classrooms_owner_id_idx" ON "classrooms"("owner_id");

-- CreateIndex
CREATE INDEX "classrooms_status_idx" ON "classrooms"("status");

-- CreateIndex
CREATE INDEX "classroom_members_user_id_idx" ON "classroom_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_members_classroom_id_user_id_key" ON "classroom_members"("classroom_id", "user_id");

-- CreateIndex
CREATE INDEX "topics_classroom_id_order_index_idx" ON "topics"("classroom_id", "order_index");

-- CreateIndex
CREATE INDEX "lessons_topic_id_order_index_idx" ON "lessons"("topic_id", "order_index");

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_members" ADD CONSTRAINT "classroom_members_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_members" ADD CONSTRAINT "classroom_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
