ALTER TABLE public.historico_limite ADD COLUMN IF NOT EXISTS dependente_id uuid REFERENCES public.dependentes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_historico_limite_dependente ON public.historico_limite(dependente_id);
CREATE INDEX IF NOT EXISTS idx_historico_limite_associado ON public.historico_limite(associado_id);