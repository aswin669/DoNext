-- CreateTable
CREATE TABLE "CommunicationConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "webhookUrl" TEXT,
    "channelId" TEXT,
    "email" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "preferences" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationConnection_userId_platform_key" ON "CommunicationConnection"("userId", "platform");

-- AddForeignKey
ALTER TABLE "CommunicationConnection" ADD CONSTRAINT "CommunicationConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
