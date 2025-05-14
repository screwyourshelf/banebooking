DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    RAISE NOTICE 'Behandler tabell: %', r.tablename;

    -- Aktiver RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);

    -- fjerne tidligere policy
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "API-policy" ON public.%I;', r.tablename);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Klarte ikke droppe policy %', r.tablename;
    END;

    -- Lag ny policy
    EXECUTE format($sql$
      CREATE POLICY "API-policy"
      ON public.%I
      FOR ALL
      TO public
      USING (current_user = 'banebooking_api');
    $sql$, r.tablename);

    RAISE NOTICE 'Policy opprettet for %', r.tablename;
  END LOOP;
END $$;
