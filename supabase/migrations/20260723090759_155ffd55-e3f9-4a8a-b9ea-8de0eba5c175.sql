ALTER TABLE public.carencias ADD COLUMN IF NOT EXISTS dependente_id uuid REFERENCES public.dependentes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_carencias_dependente ON public.carencias(dependente_id);
CREATE INDEX IF NOT EXISTS idx_carencias_associado ON public.carencias(associado_id);