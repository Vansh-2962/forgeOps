-- CreateTable
CREATE TABLE "GithubConnections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubUserId" TEXT NOT NULL,
    "githubUserName" TEXT NOT NULL,
    "githubEmail" TEXT,
    "avatarUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GithubConnections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubConnections_userId_key" ON "GithubConnections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GithubConnections_githubUserId_key" ON "GithubConnections"("githubUserId");

-- CreateIndex
CREATE INDEX "GithubConnections_userId_idx" ON "GithubConnections"("userId");

-- AddForeignKey
ALTER TABLE "GithubConnections" ADD CONSTRAINT "GithubConnections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
