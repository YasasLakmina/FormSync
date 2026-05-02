-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "name"      TEXT,
    "password"  TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Schema" (
    "id"           TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "description"  TEXT,
    "content"      JSONB NOT NULL,
    "sourceFormat" TEXT NOT NULL DEFAULT 'json',
    "tags"         TEXT[],
    "status"       TEXT NOT NULL DEFAULT 'draft',
    "userId"       TEXT NOT NULL,
    "version"      INTEGER NOT NULL DEFAULT 1,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FormTemplate" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "content"     JSONB NOT NULL,
    "userId"      TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SrsProject" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "userId"      TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SrsProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserStory" (
    "id"                TEXT NOT NULL,
    "title"             TEXT NOT NULL,
    "role"              TEXT NOT NULL,
    "action"            TEXT NOT NULL,
    "benefit"           TEXT NOT NULL,
    "acceptanceCriteria" TEXT[],
    "suggestedFields"   JSONB NOT NULL,
    "featureArea"       TEXT NOT NULL DEFAULT 'General',
    "confidence"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status"            TEXT NOT NULL DEFAULT 'draft',
    "generatedSchemaId" TEXT,
    "rawText"           TEXT NOT NULL DEFAULT '',
    "projectId"         TEXT NOT NULL,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStory_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FormTemplate_userId_idx" ON "FormTemplate"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SrsProject_userId_idx" ON "SrsProject"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserStory_projectId_idx" ON "UserStory"("projectId");

-- AddForeignKey (only if not already present)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Schema_userId_fkey'
  ) THEN
    ALTER TABLE "Schema"
      ADD CONSTRAINT "Schema_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FormTemplate_userId_fkey'
  ) THEN
    ALTER TABLE "FormTemplate"
      ADD CONSTRAINT "FormTemplate_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SrsProject_userId_fkey'
  ) THEN
    ALTER TABLE "SrsProject"
      ADD CONSTRAINT "SrsProject_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UserStory_projectId_fkey'
  ) THEN
    ALTER TABLE "UserStory"
      ADD CONSTRAINT "UserStory_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "SrsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
