
-- =========================================================
-- EVENTOS
-- =========================================================
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'geral',
  local TEXT,
  endereco TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  capacidade INT,
  imagem_url TEXT,
  permite_rsvp BOOLEAN NOT NULL DEFAULT true,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.eventos TO authenticated;
GRANT ALL ON public.eventos TO service_role;

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos ativos visíveis a autenticados"
  ON public.eventos FOR SELECT TO authenticated
  USING (ativo = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gerencia eventos"
  ON public.eventos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_eventos_data ON public.eventos(data_inicio DESC) WHERE ativo = true;

-- =========================================================
-- RSVPs
-- =========================================================
CREATE TABLE public.evento_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  associado_id UUID NOT NULL,
  dependente_id UUID,
  nome TEXT NOT NULL,
  matricula TEXT,
  status TEXT NOT NULL DEFAULT 'confirmado',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (evento_id, associado_id, dependente_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.evento_rsvps TO authenticated;
GRANT ALL ON public.evento_rsvps TO service_role;

ALTER TABLE public.evento_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin vê todos rsvps"
  ON public.evento_rsvps FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Autenticados criam próprios rsvps"
  ON public.evento_rsvps FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin remove rsvps"
  ON public.evento_rsvps FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- AVALIACOES DE PARCEIROS
-- =========================================================
CREATE TABLE public.avaliacoes_parceiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas_parceiros(id) ON DELETE CASCADE,
  associado_id UUID NOT NULL,
  autor_nome TEXT NOT NULL,
  nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  aprovado BOOLEAN NOT NULL DEFAULT false,
  moderado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinica_id, associado_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes_parceiros TO authenticated;
GRANT ALL ON public.avaliacoes_parceiros TO service_role;

ALTER TABLE public.avaliacoes_parceiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver avaliações aprovadas ou próprias ou admin"
  ON public.avaliacoes_parceiros FOR SELECT TO authenticated
  USING (aprovado = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Qualquer autenticado insere avaliação"
  ON public.avaliacoes_parceiros FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin modera/edita avaliações"
  ON public.avaliacoes_parceiros FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin remove avaliações"
  ON public.avaliacoes_parceiros FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER avaliacoes_parceiros_updated_at
  BEFORE UPDATE ON public.avaliacoes_parceiros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- FAQ
-- =========================================================
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL DEFAULT 'geral',
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  publicado BOOLEAN NOT NULL DEFAULT true,
  visualizacoes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.faq_items TO authenticated;
GRANT ALL ON public.faq_items TO service_role;

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQ publicado visível a autenticados"
  ON public.faq_items FOR SELECT TO authenticated
  USING (publicado = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gerencia FAQ"
  ON public.faq_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_faq_categoria_ordem ON public.faq_items(categoria, ordem) WHERE publicado = true;
