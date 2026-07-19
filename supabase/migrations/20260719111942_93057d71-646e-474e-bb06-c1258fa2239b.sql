
-- SYNC SOURCES: configuração de endpoints externos a serem consumidos
CREATE TABLE public.sync_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  entidade text NOT NULL CHECK (entidade IN ('associados','dependentes','clinicas_parceiros','limites','carencias','informes_rendimentos')),
  metodo text NOT NULL DEFAULT 'GET' CHECK (metodo IN ('GET','POST')),
  url text NOT NULL,
  auth_tipo text NOT NULL DEFAULT 'none' CHECK (auth_tipo IN ('none','bearer','apikey','basic')),
  auth_token text,
  auth_header_name text DEFAULT 'Authorization',
  headers_extras jsonb DEFAULT '{}'::jsonb,
  body_template jsonb,
  response_path text,
  campo_chave text NOT NULL DEFAULT 'matricula',
  mapeamento jsonb NOT NULL DEFAULT '{}'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  frequencia text NOT NULL DEFAULT 'manual' CHECK (frequencia IN ('manual','horaria','diaria','semanal')),
  ultima_sincronizacao timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_sources TO authenticated;
GRANT ALL ON public.sync_sources TO service_role;
ALTER TABLE public.sync_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam sync_sources" ON public.sync_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_sync_sources_updated BEFORE UPDATE ON public.sync_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SYNC LOGS
CREATE TABLE public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.sync_sources(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('sucesso','erro','parcial')),
  registros_processados integer DEFAULT 0,
  registros_inseridos integer DEFAULT 0,
  registros_atualizados integer DEFAULT 0,
  mensagem text,
  detalhes jsonb,
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  finalizado_em timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_logs TO authenticated;
GRANT ALL ON public.sync_logs TO service_role;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins veem sync_logs" ON public.sync_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- WEBHOOK ENDPOINTS: recebem push do sistema interno
CREATE TABLE public.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  entidade text NOT NULL CHECK (entidade IN ('associados','dependentes','clinicas_parceiros','limites','carencias','informes_rendimentos')),
  slug text NOT NULL UNIQUE,
  secret_token text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  ultima_chamada timestamptz,
  total_chamadas integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_endpoints TO authenticated;
GRANT ALL ON public.webhook_endpoints TO service_role;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam webhooks" ON public.webhook_endpoints FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_webhook_endpoints_updated BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
