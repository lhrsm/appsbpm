ALTER TABLE public.clinicas_parceiros
  ADD COLUMN IF NOT EXISTS whatsapp varchar(20),
  ADD COLUMN IF NOT EXISTS estado varchar(2),
  ADD COLUMN IF NOT EXISTS especialidades text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS horarios jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_clinicas_estado ON public.clinicas_parceiros(estado);
CREATE INDEX IF NOT EXISTS idx_clinicas_cidade ON public.clinicas_parceiros(cidade);
CREATE INDEX IF NOT EXISTS idx_clinicas_especialidades ON public.clinicas_parceiros USING gin(especialidades);