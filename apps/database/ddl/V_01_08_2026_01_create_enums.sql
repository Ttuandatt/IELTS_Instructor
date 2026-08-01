-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('learner', 'instructor', 'admin');

-- CreateEnum
CREATE TYPE "CefrLevel" AS ENUM ('A2', 'B1', 'B2', 'C1');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('matching_headings', 'true_false_notgiven', 'yes_no_notgiven', 'mcq', 'matching_information', 'matching_features', 'matching_sentence_endings', 'sentence_completion', 'summary_completion', 'table_completion', 'flowchart_completion', 'diagram_label_completion', 'short');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('task1', 'task2');

-- CreateEnum
CREATE TYPE "ModelTier" AS ENUM ('cheap', 'premium');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('pending', 'done', 'failed');

-- CreateEnum
CREATE TYPE "ClassroomStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "ClassroomRole" AS ENUM ('teacher', 'student');

-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('text', 'video', 'passage', 'prompt');

-- CreateEnum
CREATE TYPE "SubmissionState" AS ENUM ('draft', 'submitted', 'ai_scored', 'ai_failed', 'released_ai', 'pending_review', 'finalized');

-- CreateEnum
CREATE TYPE "WritingMode" AS ENUM ('instant', 'review_first');
