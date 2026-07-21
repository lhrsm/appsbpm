
CREATE TABLE public.peculio_solicitacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_nome TEXT NOT NULL,
  associado_matricula TEXT NOT NULL,
  associado_email TEXT,
  associado_telefone TEXT,
  beneficiarios JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.peculio_solicitacoes TO authenticated;
GRANT ALL ON public.peculio_solicitacoes TO service_role;

ALTER TABLE public.peculio_solicitacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage peculio_solicitacoes"
  ON public.peculio_solicitacoes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_peculio_solicitacoes_updated_at
  BEFORE UPDATE ON public.peculio_solicitacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_peculio_solicitacoes_created_at ON public.peculio_solicitacoes(created_at DESC);
CREATE INDEX idx_peculio_solicitacoes_matricula ON public.peculio_solicitacoes(associado_matricula);
