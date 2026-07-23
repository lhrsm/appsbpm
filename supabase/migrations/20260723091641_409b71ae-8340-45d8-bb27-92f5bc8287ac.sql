
-- Tabela de consentimentos LGPD
CREATE TABLE IF NOT EXISTS public.consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  associado_id UUID REFERENCES public.associados(id) ON DELETE CASCADE,
  dependente_id UUID REFERENCES public.dependentes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'termos_uso' | 'politica_privacidade' | 'cookies' | 'tratamento_dados'
  versao TEXT NOT NULL DEFAULT '1.0',
  aceito BOOLEAN NOT NULL DEFAULT true,
  ip TEXT,
  user_agent TEXT,
  aceito_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.consentimentos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consentimentos TO authenticated;
GRANT ALL ON public.consentimentos TO service_role;

ALTER TABLE public.consentimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register consent"
  ON public.consentimentos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all consents"
  ON public.consentimentos FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view own by associado"
  ON public.consentimentos FOR SELECT
  TO anon, authenticated
  USING (true);

-- Tabela de solicitações de privacidade
CREATE TABLE IF NOT EXISTS public.solicitacoes_privacidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  associado_id UUID REFERENCES public.associados(id) ON DELETE SET NULL,
  dependente_id UUID REFERENCES public.dependentes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL, -- 'exclusao' | 'portabilidade' | 'revogacao' | 'correcao'
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente' | 'em_analise' | 'atendida' | 'recusada'
  resposta TEXT,
  solicitante_nome TEXT,
  solicitante_email TEXT,
  solicitante_documento TEXT,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.solicitacoes_privacidade TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solicitacoes_privacidade TO authenticated;
GRANT ALL ON public.solicitacoes_privacidade TO service_role;

ALTER TABLE public.solicitacoes_privacidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create privacy request"
  ON public.solicitacoes_privacidade FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all privacy requests"
  ON public.solicitacoes_privacidade FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_solicitacoes_privacidade_updated_at
  BEFORE UPDATE ON public.solicitacoes_privacidade
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
