
CREATE TABLE public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  associado_id uuid REFERENCES public.associados(id) ON DELETE CASCADE,
  dependente_id uuid REFERENCES public.dependentes(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  corpo text NOT NULL,
  categoria text NOT NULL DEFAULT 'geral',
  url text,
  lida boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notificacoes_associado ON public.notificacoes(associado_id, created_at DESC);
CREATE INDEX idx_notificacoes_dependente ON public.notificacoes(dependente_id, created_at DESC);
CREATE INDEX idx_notificacoes_lida ON public.notificacoes(lida);

GRANT SELECT, INSERT, UPDATE ON public.notificacoes TO anon, authenticated;
GRANT ALL ON public.notificacoes TO service_role;

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lê notificações" ON public.notificacoes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "público marca como lida" ON public.notificacoes
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "público insere notificações" ON public.notificacoes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins deletam notificações" ON public.notificacoes
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
