-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "blurb" VARCHAR(300) NOT NULL,
    "sentiment" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestLog_pkey" PRIMARY KEY ("id")
);
