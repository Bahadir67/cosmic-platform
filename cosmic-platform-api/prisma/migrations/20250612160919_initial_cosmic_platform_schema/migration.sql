-- CreateEnum
CREATE TYPE "PlanetType" AS ENUM ('MERCURY', 'VENUS', 'MARS', 'JUPITER', 'EARTH', 'KRONOS');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('LAYER', 'SATELLITE');

-- CreateEnum
CREATE TYPE "BridgeType" AS ENUM ('REFERENCE', 'INSPIRATION', 'UPDATE', 'DEBATE');

-- CreateTable
CREATE TABLE "star_systems" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "brightness" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "star_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planets" (
    "id" TEXT NOT NULL,
    "star_system_id" TEXT NOT NULL,
    "planetType" "PlanetType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "planet_id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "entropy_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridges" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "bridge_type" "BridgeType" NOT NULL,
    "reason" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bridges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "star_systems_username_key" ON "star_systems"("username");

-- CreateIndex
CREATE UNIQUE INDEX "star_systems_email_key" ON "star_systems"("email");

-- AddForeignKey
ALTER TABLE "planets" ADD CONSTRAINT "planets_star_system_id_fkey" FOREIGN KEY ("star_system_id") REFERENCES "star_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_planet_id_fkey" FOREIGN KEY ("planet_id") REFERENCES "planets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridges" ADD CONSTRAINT "bridges_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridges" ADD CONSTRAINT "bridges_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridges" ADD CONSTRAINT "bridges_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "star_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
