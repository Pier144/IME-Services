-- ---------------------------------------------------------------------------
-- `_prisma_migrations` la crea Prisma da sé prima di eseguire le migrazioni,
-- quindi non passa dalla migrazione iniziale e restava senza protezione.
-- Sta comunque nello schema `public`, che Supabase espone via Data API: da lì
-- si leggevano nomi, date e checksum di tutte le migrazioni.
--
-- Non sono dati personali, ma è comunque una descrizione gratuita del sistema
-- servita a chiunque abbia la chiave anon. Stessa protezione delle altre
-- tabelle; Prisma non se ne accorge perché usa il ruolo `postgres`.
-- ---------------------------------------------------------------------------

ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "_prisma_migrations" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "_prisma_migrations" FROM authenticated;
  END IF;
END $$;
