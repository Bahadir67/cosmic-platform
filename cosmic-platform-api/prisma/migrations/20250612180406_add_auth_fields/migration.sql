/*
  Warnings:

  - You are about to drop the column `confidence` on the `bridges` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `bridges` table. All the data in the column will be lost.
  - You are about to drop the column `creator_id` on the `bridges` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `bridges` table. All the data in the column will be lost.
  - You are about to drop the column `source_id` on the `bridges` table. All the data in the column will be lost.
  - You are about to drop the column `target_id` on the `bridges` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `planets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `planets` table. All the data in the column will be lost.
  - You are about to drop the column `planetType` on the `planets` table. All the data in the column will be lost.
  - You are about to drop the column `brightness` on the `star_systems` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `star_systems` table. All the data in the column will be lost.
  - You are about to drop the column `reputation` on the `star_systems` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `star_systems` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email_verify_token]` on the table `star_systems` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password_reset_token]` on the table `star_systems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by` to the `bridges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from_content_id` to the `bridges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_content_id` to the `bridges` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `bridge_type` on the `bridges` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `content_type` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `star_system_id` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `planets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planet_type` to the `planets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `planets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `star_systems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `star_systems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bridges" DROP CONSTRAINT "bridges_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "bridges" DROP CONSTRAINT "bridges_source_id_fkey";

-- DropForeignKey
ALTER TABLE "bridges" DROP CONSTRAINT "bridges_target_id_fkey";

-- DropForeignKey
ALTER TABLE "content" DROP CONSTRAINT "content_planet_id_fkey";

-- DropForeignKey
ALTER TABLE "planets" DROP CONSTRAINT "planets_star_system_id_fkey";

-- AlterTable
ALTER TABLE "bridges" DROP COLUMN "confidence",
DROP COLUMN "createdAt",
DROP COLUMN "creator_id",
DROP COLUMN "reason",
DROP COLUMN "source_id",
DROP COLUMN "target_id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "from_content_id" TEXT NOT NULL,
ADD COLUMN     "strength" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "to_content_id" TEXT NOT NULL,
DROP COLUMN "bridge_type",
ADD COLUMN     "bridge_type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "content" DROP COLUMN "createdAt",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
ADD COLUMN     "content_type" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "media_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "star_system_id" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'public',
ALTER COLUMN "planet_id" DROP NOT NULL,
ALTER COLUMN "metadata" DROP NOT NULL,
ALTER COLUMN "metadata" DROP DEFAULT,
ALTER COLUMN "entropy_score" DROP NOT NULL,
ALTER COLUMN "entropy_score" DROP DEFAULT;

-- AlterTable
ALTER TABLE "planets" DROP COLUMN "config",
DROP COLUMN "createdAt",
DROP COLUMN "planetType",
ADD COLUMN     "color_scheme" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "planet_type" TEXT NOT NULL,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "star_systems" DROP COLUMN "brightness",
DROP COLUMN "createdAt",
DROP COLUMN "reputation",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verify_token" TEXT,
ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "locked_until" TIMESTAMP(3),
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "BridgeType";

-- DropEnum
DROP TYPE "ContentType";

-- DropEnum
DROP TYPE "PlanetType";

-- CreateTable
CREATE TABLE "galaxies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "governance_type" TEXT NOT NULL DEFAULT 'democratic',
    "settings" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galaxies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galaxy_members" (
    "id" TEXT NOT NULL,
    "galaxy_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galaxy_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galaxy_projects" (
    "id" TEXT NOT NULL,
    "galaxy_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galaxy_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reaction_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aether_analysis" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "analyzed_by" TEXT NOT NULL,
    "analysis_type" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "insights" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aether_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "galaxies_name_key" ON "galaxies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "galaxy_members_galaxy_id_member_id_key" ON "galaxy_members"("galaxy_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_content_id_user_id_reaction_type_key" ON "reactions"("content_id", "user_id", "reaction_type");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_id_key" ON "sessions"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "star_systems_email_verify_token_key" ON "star_systems"("email_verify_token");

-- CreateIndex
CREATE UNIQUE INDEX "star_systems_password_reset_token_key" ON "star_systems"("password_reset_token");

-- AddForeignKey
ALTER TABLE "planets" ADD CONSTRAINT "planets_star_system_id_fkey" FOREIGN KEY ("star_system_id") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_star_system_id_fkey" FOREIGN KEY ("star_system_id") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_planet_id_fkey" FOREIGN KEY ("planet_id") REFERENCES "planets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridges" ADD CONSTRAINT "bridges_from_content_id_fkey" FOREIGN KEY ("from_content_id") REFERENCES "content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridges" ADD CONSTRAINT "bridges_to_content_id_fkey" FOREIGN KEY ("to_content_id") REFERENCES "content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridges" ADD CONSTRAINT "bridges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galaxies" ADD CONSTRAINT "galaxies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galaxy_members" ADD CONSTRAINT "galaxy_members_galaxy_id_fkey" FOREIGN KEY ("galaxy_id") REFERENCES "galaxies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galaxy_members" ADD CONSTRAINT "galaxy_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galaxy_projects" ADD CONSTRAINT "galaxy_projects_galaxy_id_fkey" FOREIGN KEY ("galaxy_id") REFERENCES "galaxies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galaxy_projects" ADD CONSTRAINT "galaxy_projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aether_analysis" ADD CONSTRAINT "aether_analysis_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aether_analysis" ADD CONSTRAINT "aether_analysis_analyzed_by_fkey" FOREIGN KEY ("analyzed_by") REFERENCES "star_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
