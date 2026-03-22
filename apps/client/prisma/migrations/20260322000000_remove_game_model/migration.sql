-- DropTable
DROP TABLE IF EXISTS "Game";

-- DropEnum
DROP TYPE IF EXISTS "GameDifficulty";
DROP TYPE IF EXISTS "GameCategory";
DROP TYPE IF EXISTS "GameStatus";

-- CreateTable (GameSession may already exist from db push)
CREATE TABLE IF NOT EXISTS "GameSession" (
    "id" TEXT NOT NULL,
    "gameSlug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "launchCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "GameSession_gameSlug_userId_key" ON "GameSession"("gameSlug", "userId");
