
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'dependentes' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.dependentes
      ADD COLUMN status TEXT NOT NULL DEFAULT 'ativo';
  END IF;
END $$;

ALTER TABLE public.dependentes
  DROP CONSTRAINT IF EXISTS dependentes_status_check;

ALTER TABLE public.dependentes
  ADD CONSTRAINT dependentes_status_check
  CHECK (status IN ('ativo', 'inativo', 'pendente'));

UPDATE public.dependentes SET status = 'ativo' WHERE status IS NULL;
