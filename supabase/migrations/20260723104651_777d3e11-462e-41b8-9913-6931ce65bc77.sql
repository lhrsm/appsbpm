
CREATE TABLE public.mensalidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
  referencia TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'mensalidade',
  descricao TEXT,
  valor NUMERIC(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  pago_em DATE,
  forma_pagamento TEXT,
  boleto_url TEXT,
  linha_digitavel TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensalidades TO authenticated;
GRANT SELECT ON public.mensalidades TO anon;
GRANT ALL ON public.mensalidades TO service_role;

ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read mensalidades" ON public.mensalidades
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage mensalidades" ON public.mensalidades
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));

CREATE TRIGGER update_mensalidades_updated_at
  BEFORE UPDATE ON public.mensalidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mensalidades_associado ON public.mensalidades(associado_id);
CREATE INDEX idx_mensalidades_status ON public.mensalidades(status);
CREATE INDEX idx_mensalidades_vencimento ON public.mensalidades(vencimento);
