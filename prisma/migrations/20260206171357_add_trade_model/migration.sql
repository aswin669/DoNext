-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "tradeType" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "riskAmount" DOUBLE PRECISION NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL,
    "riskRewardRatio" DOUBLE PRECISION NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "strategy" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Planned',
    "executedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "exitPrice" DOUBLE PRECISION,
    "profitLoss" DOUBLE PRECISION,
    "profitLossPercent" DOUBLE PRECISION,
    "entryImage" TEXT,
    "exitImage" TEXT,
    "journalEntry" TEXT,
    "emotion" TEXT,
    "mistakes" TEXT,
    "lessons" TEXT,
    "improvements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trade_userId_idx" ON "Trade"("userId");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "Trade"("status");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
