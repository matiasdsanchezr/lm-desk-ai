-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "selectedFiles" TEXT[],
    "messages" JSONB NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);
