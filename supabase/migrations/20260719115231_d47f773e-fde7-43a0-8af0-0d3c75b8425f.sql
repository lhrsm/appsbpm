CREATE TABLE public.comunicados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'informativo' CHECK (tipo IN ('informativo','alerta','promocao')),
  segmento TEXT NOT NULL DEFAULT 'todos' CHECK (segmento IN ('todos','cidade','aniversariantes')),
  cidade_alvo TEXT,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.comunicados TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comunicados TO authenticated;
GRANT ALL ON public.comunicados TO service_role;

ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos veem comunicados ativos e vigentes"
  ON public.comunicados FOR SELECT
  USING (
    ativo = true
    AND data_inicio <= CURRENT_DATE
    AND (data_fim IS NULL OR data_fim >= CURRENT_DATE)
  );

CREATE POLICY "Admins gerenciam comunicados"
  ON public.comunicados FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_comunicados_updated_at
  BEFORE UPDATE ON public.comunicados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_comunicados_ativo_periodo ON public.comunicados(ativo, data_inicio, data_fim);