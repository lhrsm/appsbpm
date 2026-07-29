
-- ENUMS
CREATE TYPE public.integration_status AS ENUM ('nao_configurado','em_configuracao','conectado','sincronizando','com_erro','pausado');
CREATE TYPE public.integration_source_type AS ENUM ('api','banco','planilha','csv','arquivo','exportacao_manual','intermediaria','indefinido');
CREATE TYPE public.import_batch_status AS ENUM ('rascunho','validando','validado','importando','concluido','erro','revertido','cancelado');
CREATE TYPE public.import_row_status AS ENUM ('pendente','valido','duplicado','erro','importado','ignorado','revertido');

-- 1. CONECTORES
CREATE TABLE public.integration_connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  sistema text NOT NULL,
  modulo text NOT NULL DEFAULT 'integracoes',
  descricao text,
  tipo_fonte public.integration_source_type NOT NULL DEFAULT 'indefinido',
  status public.integration_status NOT NULL DEFAULT 'nao_configurado',
  entidades text[] NOT NULL DEFAULT '{}',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  secret_refs text[] NOT NULL DEFAULT '{}',
  ultimo_erro text,
  ultima_sincronizacao timestamptz,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_connectors TO authenticated;
GRANT ALL ON public.integration_connectors TO service_role;
ALTER TABLE public.integration_connectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conectores_select" ON public.integration_connectors FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','visualizar'));
CREATE POLICY "conectores_insert" ON public.integration_connectors FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','criar'));
CREATE POLICY "conectores_update" ON public.integration_connectors FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','editar'))
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','editar'));
CREATE POLICY "conectores_delete" ON public.integration_connectors FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','excluir'));
CREATE TRIGGER trg_conectores_updated BEFORE UPDATE ON public.integration_connectors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. EXECUCOES
CREATE TABLE public.integration_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid REFERENCES public.integration_connectors(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'sincronizacao',
  status text NOT NULL DEFAULT 'executando',
  mensagem text,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  executado_por uuid,
  executado_por_email text,
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  finalizado_em timestamptz,
  duracao_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.integration_runs TO authenticated;
GRANT ALL ON public.integration_runs TO service_role;
ALTER TABLE public.integration_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runs_select" ON public.integration_runs FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','visualizar'));
CREATE POLICY "runs_insert" ON public.integration_runs FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','criar'));
CREATE POLICY "runs_update" ON public.integration_runs FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','editar'))
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','editar'));

-- 3. LOTES DE IMPORTACAO
CREATE TABLE public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid REFERENCES public.integration_connectors(id) ON DELETE SET NULL,
  entidade text NOT NULL,
  origem text NOT NULL DEFAULT 'upload_manual',
  arquivo_nome text NOT NULL,
  arquivo_tipo text,
  arquivo_tamanho integer,
  arquivo_path text,
  status public.import_batch_status NOT NULL DEFAULT 'rascunho',
  mapeamento jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_recebidos integer NOT NULL DEFAULT 0,
  total_validos integer NOT NULL DEFAULT 0,
  total_importados integer NOT NULL DEFAULT 0,
  total_duplicados integer NOT NULL DEFAULT 0,
  total_erros integer NOT NULL DEFAULT 0,
  total_ignorados integer NOT NULL DEFAULT 0,
  tempo_processamento_ms integer,
  pode_desfazer boolean NOT NULL DEFAULT false,
  observacoes text,
  criado_por uuid,
  criado_por_email text,
  revertido_em timestamptz,
  revertido_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_batches TO authenticated;
GRANT ALL ON public.import_batches TO service_role;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "batches_select" ON public.import_batches FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','visualizar'));
CREATE POLICY "batches_insert" ON public.import_batches FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','criar') AND criado_por = auth.uid());
CREATE POLICY "batches_update" ON public.import_batches FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','editar'))
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','editar'));
CREATE POLICY "batches_delete" ON public.import_batches FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','excluir'));
CREATE TRIGGER trg_batches_updated BEFORE UPDATE ON public.import_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_import_batches_created ON public.import_batches (created_at DESC);

-- 4. LINHAS (STAGING)
CREATE TABLE public.import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  linha integer NOT NULL,
  chave text,
  dados_originais jsonb NOT NULL DEFAULT '{}'::jsonb,
  dados_normalizados jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.import_row_status NOT NULL DEFAULT 'pendente',
  mensagem text,
  registro_id uuid,
  acao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_rows TO authenticated;
GRANT ALL ON public.import_rows TO service_role;
ALTER TABLE public.import_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rows_select" ON public.import_rows FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','visualizar'));
CREATE POLICY "rows_insert" ON public.import_rows FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','criar'));
CREATE POLICY "rows_update" ON public.import_rows FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','editar'))
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','editar'));
CREATE POLICY "rows_delete" ON public.import_rows FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','excluir'));
CREATE INDEX idx_import_rows_batch ON public.import_rows (batch_id, linha);

-- 5. ERROS
CREATE TABLE public.import_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  row_id uuid REFERENCES public.import_rows(id) ON DELETE CASCADE,
  linha integer,
  campo text,
  codigo text NOT NULL DEFAULT 'validacao',
  severidade text NOT NULL DEFAULT 'erro',
  mensagem text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.import_errors TO authenticated;
GRANT ALL ON public.import_errors TO service_role;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "errors_select" ON public.import_errors FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','visualizar'));
CREATE POLICY "errors_insert" ON public.import_errors FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','criar'));
CREATE POLICY "errors_delete" ON public.import_errors FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','excluir'));
CREATE INDEX idx_import_errors_batch ON public.import_errors (batch_id);

-- 6. LOGS DE SINCRONIZACAO
CREATE TABLE public.synchronization_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid REFERENCES public.integration_connectors(id) ON DELETE CASCADE,
  run_id uuid REFERENCES public.integration_runs(id) ON DELETE SET NULL,
  entidade text,
  status text NOT NULL DEFAULT 'info',
  registros_recebidos integer NOT NULL DEFAULT 0,
  registros_processados integer NOT NULL DEFAULT 0,
  registros_inseridos integer NOT NULL DEFAULT 0,
  registros_atualizados integer NOT NULL DEFAULT 0,
  registros_ignorados integer NOT NULL DEFAULT 0,
  mensagem text,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  finalizado_em timestamptz
);
GRANT SELECT, INSERT ON public.synchronization_logs TO authenticated;
GRANT ALL ON public.synchronization_logs TO service_role;
ALTER TABLE public.synchronization_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "synclogs_select" ON public.synchronization_logs FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','visualizar'));
CREATE POLICY "synclogs_insert" ON public.synchronization_logs FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','criar'));

-- 7. CONFLITOS
CREATE TABLE public.data_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES public.import_batches(id) ON DELETE CASCADE,
  row_id uuid REFERENCES public.import_rows(id) ON DELETE CASCADE,
  connector_id uuid REFERENCES public.integration_connectors(id) ON DELETE SET NULL,
  entidade text NOT NULL,
  chave text,
  campo text NOT NULL,
  valor_atual text,
  valor_novo text,
  status text NOT NULL DEFAULT 'aberto',
  resolvido_por uuid,
  resolvido_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_conflicts TO authenticated;
GRANT ALL ON public.data_conflicts TO service_role;
ALTER TABLE public.data_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conflicts_select" ON public.data_conflicts FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','visualizar'));
CREATE POLICY "conflicts_insert" ON public.data_conflicts FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','criar'));
CREATE POLICY "conflicts_update" ON public.data_conflicts FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','editar'))
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','editar'));
CREATE POLICY "conflicts_delete" ON public.data_conflicts FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','excluir'));

-- 8. MAPEAMENTOS
CREATE TABLE public.field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid REFERENCES public.integration_connectors(id) ON DELETE CASCADE,
  entidade text NOT NULL,
  nome text NOT NULL,
  mapeamento jsonb NOT NULL DEFAULT '{}'::jsonb,
  padrao boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entidade, nome)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_mappings TO authenticated;
GRANT ALL ON public.field_mappings TO service_role;
ALTER TABLE public.field_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mappings_select" ON public.field_mappings FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','visualizar'));
CREATE POLICY "mappings_insert" ON public.field_mappings FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','criar'));
CREATE POLICY "mappings_update" ON public.field_mappings FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','editar'))
  WITH CHECK (public.tem_permissao(auth.uid(),'integracoes','editar'));
CREATE POLICY "mappings_delete" ON public.field_mappings FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(),'integracoes','excluir'));
CREATE TRIGGER trg_mappings_updated BEFORE UPDATE ON public.field_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
