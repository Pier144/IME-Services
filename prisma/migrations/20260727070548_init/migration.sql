-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverAlt" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subjectType" TEXT,
    "quantity" TEXT,
    "dimensions" TEXT,
    "usage" TEXT,
    "notes" TEXT,
    "subjects" TEXT NOT NULL DEFAULT '[]',
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "source" TEXT NOT NULL DEFAULT 'soggetti-personalizzati',
    "locale" TEXT NOT NULL DEFAULT 'it',
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "about" TEXT,
    "cv" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'it',
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "QuoteRequest_createdAt_idx" ON "QuoteRequest"("createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");


-- ---------------------------------------------------------------------------
-- Sicurezza (specifico di Supabase)
--
-- Le tabelle stanno nello schema `public`, che Supabase espone anche tramite
-- Data API usando la chiave `anon` — chiave che per progetto è pubblica. Senza
-- protezione chiunque la conosca potrebbe leggere richieste di preventivo e
-- candidature, cioè nomi, email, telefoni e riferimenti ai curriculum.
--
-- Doppia barriera:
--   1. RLS attiva e nessuna policy → nessuna riga visibile a anon/authenticated.
--   2. Privilegi revocati → la tabella non è proprio raggiungibile da lì.
--
-- L'applicazione non se ne accorge: Prisma si collega con il ruolo `postgres`,
-- che ha BYPASSRLS (verificato su questo progetto).
-- ---------------------------------------------------------------------------

ALTER TABLE "Article" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobApplication" ENABLE ROW LEVEL SECURITY;

-- I ruoli `anon` e `authenticated` esistono solo su Supabase: il controllo
-- tiene la migrazione valida anche su un Postgres qualunque.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "Article", "QuoteRequest", "JobApplication" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "Article", "QuoteRequest", "JobApplication" FROM authenticated;
  END IF;
END $$;
