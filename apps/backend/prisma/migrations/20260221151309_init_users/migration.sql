-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('learner', 'instructor', 'admin');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'learner',
    "language" VARCHAR(5) NOT NULL DEFAULT 'vi',
    "theme" VARCHAR(10) NOT NULL DEFAULT 'light',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
