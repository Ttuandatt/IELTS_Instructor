-- AlterTable
ALTER TABLE "passages" ADD COLUMN     "collection" VARCHAR(100);

-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "collection" VARCHAR(100);

-- AlterTable
ALTER TABLE "submissions_reading" ADD COLUMN     "test_mode" VARCHAR(20) NOT NULL DEFAULT 'practice';
