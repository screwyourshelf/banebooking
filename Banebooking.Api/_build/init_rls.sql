DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tableowner != 'postgres'  -- Hopper over systemtabeller
  LOOP
    -- Aktiver RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);

    -- Fjern eksisterende policy hvis den finnes
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "API-policy" ON public.%I;', r.tablename);
    EXCEPTION WHEN others THEN
      -- Fortsett selv om policy ikke finnes
    END;

    -- Lag ny policy som tillater kun API-brukeren
    EXECUTE format($sql$
      CREATE POLICY "API-policy"
      ON public.%I
      FOR ALL
      TO public  -- Gjelder alle roller (current_user sjekkes i USING)
      USING (current_user = 'banebooking_api');
    $sql$, r.tablename);
  END LOOP;
END $$;