
CREATE TABLE public.documentos_associado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
  dependente_id UUID REFERENCES public.dependentes(id) ON DELETE CASCADE,
  visibilidade TEXT NOT NULL DEFAULT 'todos',
  categoria TEXT NOT NULL DEFAULT 'outros',
  titulo TEXT NOT NULL,
  descricao TEXT,
  arquivo_path TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tipo TEXT,
  arquivo_tamanho INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT true,
  publicado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_associado TO authenticated;
GRANT SELECT ON public.documentos_associado TO anon;
GRANT ALL ON public.documentos_associado TO service_role;

ALTER TABLE public.documentos_associado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read documentos" ON public.documentos_associado
  FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE POLICY "Admins manage documentos" ON public.documentos_associado
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));

CREATE TRIGGER update_documentos_updated_at
  BEFORE UPDATE ON public.documentos_associado
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_documentos_associado ON public.documentos_associado(associado_id);
CREATE INDEX idx_documentos_dependente ON public.documentos_associado(dependente_id);

-- Storage policies para o bucket 'documentos'
CREATE POLICY "Public read documentos bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'documentos');

CREATE POLICY "Admins upload documentos bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos' AND (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid())));

CREATE POLICY "Admins update documentos bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documentos' AND (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid())));

CREATE POLICY "Admins delete documentos bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documentos' AND (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid())));
