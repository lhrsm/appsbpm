
CREATE TABLE public.solicitacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
  dependente_id UUID REFERENCES public.dependentes(id) ON DELETE SET NULL,
  solicitante_nome TEXT NOT NULL,
  solicitante_tipo TEXT NOT NULL DEFAULT 'titular',
  categoria TEXT NOT NULL,
  assunto TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto',
  prioridade TEXT NOT NULL DEFAULT 'normal',
  sla_prazo TIMESTAMPTZ,
  resposta TEXT,
  respondido_por UUID,
  respondido_em TIMESTAMPTZ,
  anexos JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.solicitacoes TO authenticated;
GRANT SELECT, INSERT ON public.solicitacoes TO anon;
GRANT ALL ON public.solicitacoes TO service_role;

ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create solicitacoes" ON public.solicitacoes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view solicitacoes" ON public.solicitacoes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage solicitacoes" ON public.solicitacoes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));

CREATE TRIGGER update_solicitacoes_updated_at
  BEFORE UPDATE ON public.solicitacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_solicitacoes_associado ON public.solicitacoes(associado_id);
CREATE INDEX idx_solicitacoes_status ON public.solicitacoes(status);
CREATE INDEX idx_solicitacoes_created ON public.solicitacoes(created_at DESC);
