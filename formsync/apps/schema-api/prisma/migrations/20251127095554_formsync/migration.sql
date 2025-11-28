-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schema" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "sourceFormat" TEXT NOT NULL DEFAULT 'json',
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "userId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaVersion" (
    "id" TEXT NOT NULL,
    "schemaId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "changeLog" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemaVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Schema_userId_idx" ON "Schema"("userId");

-- CreateIndex
CREATE INDEX "Schema_status_idx" ON "Schema"("status");

-- CreateIndex
CREATE INDEX "Schema_createdAt_idx" ON "Schema"("createdAt");

-- CreateIndex
CREATE INDEX "SchemaVersion_schemaId_idx" ON "SchemaVersion"("schemaId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemaVersion_schemaId_version_key" ON "SchemaVersion"("schemaId", "version");

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaVersion" ADD CONSTRAINT "SchemaVersion_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
